var async = require('asyncawait/async');
var await = require('asyncawait/await');
var asyncHandler = require('async-handler')(async, await);

module.exports = {

  //  internal function for creating new employers on the map
  //    req
  //    user_id
  //    wage (int > 0)
  //    business_type (string)
  internal_employer_create: function(req, user_id, wage, business_type) {
    // check hex for existance and proper ownership
    try { await(AuthService.hex_authenticate_async(req, user_id)); }  // verify that the user is the hex owner (or admin)
    catch(err) { throw new Error('Hex authentication error:' + err); };
    
    // creates object "new_employer" with the provided info
    var new_employer = {business_type: business_type, hex: req.param('hex_name'), wage: wage};
      
    // creates the new account in the database with the new_account object
    try { var employer_dictect = await(Employers.create(new_employer)); }
    catch(err) { throw new Error('Account creation error: ' + err); }
    return employer_dictect;
  },
  
  // check if there are enough funds to pay hired works (and auto-adjust if f_execute=true)
  internal_employer_funds_check: function(f_execute) {
    // store all employers from db in local list
    try { var employers_list = await(Employers.find({})); }
    catch(err) { throw new Error('Employer search db fail: ' + err); }
    
    // store all accounts from db in local list
    try { var accounts_list_unprocessed = await(Accounts.find({})); }
    catch(err) { throw new Error('Accounts list db fail: ' + err); }
    // index accounts as list[id] = total
    var accounts_dict = {};
    for (var account of accounts_list_unprocessed) {
      accounts_dict[account.id] = account.amount;
    }
    
    // loop through each employer
    for (var employer in employers_list) {
      // check if insufficient funds and adapt (only if this is the actual weekly routine)
      if (f_execute) {
        var f_positions_changed = false;
        while (accounts_dict[employer.account] < employer.positions * employer.wage) {
          employer.positions -= 1;
          f_positions_changed = true;
        }
        if (f_positions_changed) {
          try { await(Employers.update(employer.id, {positions: employer.positions})); }
          catch(err) { throw new Error('Employee qty update db fail: ' + err); }
        }
      }
      // subtract: account total = account total - employees*wage
      accounts_dict[employer.account] -= employer.positions * employer.wage;
    }
    
    if (!f_execute) {
      var fail_accounts = {};
      for (var account in accounts_dict) {
        if (accounts_dict[account] < 0) fail_accounts[account] = accounts_dict[account];
      }
      return fail_accounts;
    }
    
    return;
  },
  
  
  
  // admin function to assign jobs, housing, and all other cycled actions for virtual citizens once/week
  weekly_citizen_action_routine: asyncHandler(function (req, res) {
    
    // define internal functions that have access to main function variables:
    
    // formally adds a person to a home
    function add_citizen_to_home(citizen_id, home_id) {
      homes_dict[home_id].res_count += 1;  // add residents in housing unit
      citizens_dict[citizen_id].home = home_id;  // add citizen reference to home
    }
    
    // formally removes a person from a home
    function remove_citizen_from_home(citizen_id) {
      homes_dict[citizens_dict[citizen_id].home].res_count -= 1;  // reduce residents in housing unit
      citizens_dict[citizen_id].home = null;  // remove citizen reference to home
    }
    
    // helper function to check if a single home meets qualifications for renting
    function check_single_home(best, home_id, wage) {
      if ((homes_dict[home_id].rent <= (wage / 2))  // check if the looped home's rent is <= half the wage
          && (homes_dict[home_id].res_count < homes_dict[home_id].capacity)   // and check if the home is full yet
          && (homes_dict[home_id].rent < best.price)) {  // and check if this price beats the previous best price
        best.home_id = home_id;  // if so, make this home the best home
        best.price = homes_dict[home_id].rent;  // and this price the new price to beat
      }
      return best;
    }
    
    // search for a home when a given employer has been selected (even tentatively)
    function home_search(region, wage) {
      var best = { price: wage, home_id: false };  // begin w/ high price to beat (full wage) and no best home
      for (var home_id of home_ids_by_region_status[region]["upgraded"] ) {  // start searching upgraded homes in the citizen's work region
        best = check_single_home(best, home_id, wage);  // check for better price w/ helper and resave "best"
      }
      if (best_home_id) return best_home_id;  // if an upgraded home meets the qualifications, take it
        
      for (var home_id of home_ids_by_region_status[region]["regular"] ) {
        best = check_single_home(best, home_id, wage);
      }
      return best.home_id;  // if a regular home is the first to meet qualifications, then choose that
    }
    
    // search for a job in a given region
    function job_search(region, min_wage) {  // set prior wage to 0 when searching from unemployed or prior wage + 50 for improved job
      var best = { wage: min_wage, employer_id: false };  // begin w/ wage to beat and no best job
      for (var position of open_positions_by_region[region] ) {  // start searching upgraded homes in the citizen's work region
        if (position.wage > best.wage) best.employer_id = position.employer;
      }
      return best.employer_id;  // return either an employer_id or a 
    }
    
    function add_citizen_to_job(citizen_id, position) {
      employers_dict[position.employer].worker_count += 1;  // increase the worker_count by 1 after hiring
      citizens_dict[citizen_id].employer = position.employer;  // add employer reference to citizen
      unemployed_citizens_list.splice(unemployed_citizens_list.indexOf(citizen_id), 1);  // remove the citizen_id from unemployed_citizens_list
      // remove the position from available
      for (var i=0; i<open_positions_by_region[position.region].length; i++) {  // loop thru all until found, then remove and exit
        if (open_positions_by_region[position.region][i].employer == position.employer) {
          open_positions_by_region[position.region].splice(i, 1);  // remove the position from open_positions_by_region
          break;
        }
      }
    }
    
    function remove_citizen_from_job(citizen_id) {
      employers_dict[citizens_dict[citizen_id].employer].worker_count -= 1;  // reduce the worker_count by 1 after firing
      citizens_dict[citizen_id].employer = null;  // remove employer reference from citizen
      unemployed_citizens_list.push(citizen_id);  // add citizen_id to unemployed
    }
    
    
    // main execution thread for weekly job and housing shuffle
    
    // check all employers for sufficient funds to pay employees scheduled and adjust if needed
    try { await(this.internal_employer_funds_check(true)); }
    catch(err) { return RespService.e(res, "internal_employer_funds_check error:" + err); };

    // lookup all homes
    try { var homes_list_unprocessed = await(Homes.find({}).populate('hex')); }  // find all homes and include the location full data
    catch(err) { return RespService.e(res, "Homes list db fail: " + err); }
    var homes_dict = {};  // function-wide variable with all home info indexed as obj[id] = home
    var home_ids_by_region_status = {};  // function-wide variable with just the ids stored in lists indexed by obj[region][upgraded/not]
    for (var home of homes_list_unprocessed) {
      homes_dict[home.id] = home;
      if (!home_ids_by_region_status[home.hex.region]) home_ids_by_region_status[home.hex.region] = { upgraded: [], regular: [] };  // create arrays for two statuses within each region in object if needed
      var type = home.upgraded ? "upgraded" : "regular";  // set home type as a string for use in object indexing
      home_ids_by_region_status[home.hex.region][type].push(home.id);  //  add the id to the correct array
    }
    
    // lookup all citizens, check employment, and add to proper list indexed by id
    try { var citizens_list_unprocessed = await(Citizens.find({})); }
    catch(err) { return RespService.e(res, "Citizens list db fail: " + err); }
    var citizens_dict = {};  // function-wide variable w/ citizens indexed as obj[id] 
    var unemployed_citizens_list = [];  // list of the indexes of unemployed citizens
    for (var citizen of citizens_list_unprocessed) {
      citizens_dict[citizen.id] = citizen;  // add each citizen under index
      if (!(citizen.employer)) unemployed_citizens_list.push(citizen.id);  // if no employer, add to unemployed list
    } 
    
    // lookup all employers, index them by region, and check to see if there were any positions cut
    try { var unprocessed_employers_list = await(Employers.find({}).populate('workers','hex')); }
    catch(err) { return RespService.e(res, "Employer search db fail: " + err); }
    var employers_dict = {};  // function-wide variable w/ employers indexed as obj[id]
    var employer_ids_by_region = {};  // function-wide variable w/ employer_ids listed by region
    for (var employer of unprocessed_employers_list) {
      employers_dict[employer.id] = employer;  // add employer to the organized dictionary
      if (!employer_ids_by_region[employer.hex.region]) employer_ids_by_region[employer.hex.region] = [];  // create array in object per region
      employer_ids_by_region[employer.hex.region].push(employer.id);  // add ids to array by region for easy lookup later
    }
    
    // scan all employers for extra employees to be cut
    for (var employer_id in employers_dict) {
      var employer = employers_dict[employer_id];  // store employer for convenience
      if (employer.positions < employer.worker_count) {  // check if there are too many workers given new position numbers
        for (var i=0; i<(employer.worker_count-employer.positions); i++) {  // fire each extra employee
          remove_citizen_from_home(employer.workers[i].id);  // make citizen homeless
          remove_citizen_from_job(employer.workers[i].id); // make citizen unemployed
        }
      }
    }
    
    // go through each employed person to verify that they can still afford housing (and quit job if not)
    for (var citizen_id in citizens_dict) {
      var wage = citizens_dict[citizen_id].employer.wage;  // store wage locally for convenience
      if ((wage / 2) < (citizens_dict[citizen_id].home.rent)) {  // check if half wage is enough to cover updated rent
        remove_citizen_from_home(citizen_id);  // abandon home
        var best_home_id = home_search(employers_dict[citizens_dict[citizen_id].employer.id].hex.region, wage);  // search for new home in region
        if (best_home_id) add_citizen_to_home(citizen_id, best_home_id);  // add new home or
        else remove_citizen_from_job(citizen_id);  // quit job due to lack of affordable housing
      }
    }
    
    // create list of open positions across the map
    var open_positions_by_region = {};
    for (var region in employer_ids_by_region) {
      for (var employer_id of employer_ids_by_region[region])
      if (employers_dict[employer_id].worker_count < employers_dict[employer_id].positions) {  // check if there are too few workers given new position numbers
        var position = { employer: employer_id, wage: employers_dict[employer_id].wage, region: region };  // add essentials to a position object
        for (var i=0; i<(employers_dict[employer_id].positions - employers_dict[employer_id].worker_count); i++) {  // for every open position...
          open_positions_by_region[region].push(position);  // add object to the function-wide positions variable by region
        }
      }
    }
    
    // cycle through employed citizens for opportunity to upgrade to a better paying job if pay > +50 AND housing available
    var f_changed = true;
    while (f_changed) {
      for (var citizen_id in citizens_dict) {
        if (citizens_dict[citizen_id].employer) {  // if employed, look for better job
          
        }
      }
    }
    // repeat until nobody changes jobs for a full cycle
    // on job change call helper func to quit job (open position) and other to add job
        // job_search(citizen_dict, region) per region
        // if_success in a region check housing
        // keep highest salary w/ housing available
        // stay unemployed if nothing
    
    // cycle once through unemployed citizens to find jobs
    // call helper func to add job
    
    // fill open positions with out-of-town people if criteria met
    // call helper func to create a citizen and then helper to add job
    
    // bill employers for all filled jobs
    
    
    
    try { await(Employers.update({}, {worker_count: 0})); }
    catch(err) { throw new Error('Employee qty update db fail: ' + err); }
    
    
    
    // pay housing providers for all filled spots
    
    
    // return full report of what just happened to admin console to be emailed to class
    
  }),
  
}  // controller end

