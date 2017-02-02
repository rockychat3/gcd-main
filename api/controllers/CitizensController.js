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
    try { var employer_object = await(Employers.create(new_employer)); }
    catch(err) { throw new Error('Account creation error: ' + err); }
    return employer_object;
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
    var accounts_obj = {};
    for (var account of accounts_list_unprocessed) {
      accounts_obj[account.id] = account.amount;
    }
    
    // loop through each employer
    for (var employer in employers_list) {
      // check if insufficient funds and adapt (only if this is the actual weekly routine)
      if (f_execute) {
        var f_positions_changed = false;
        while (accounts_obj[employer.account] < employer.positions * employer.wage) {
          employer.positions -= 1;
          f_positions_changed = true;
        }
        if (f_positions_changed) {
          try { await(Employers.update(employer.id, {positions: employer.positions})); }
          catch(err) { throw new Error('Employee qty update db fail: ' + err); }
        }
      }
      // subtract: account total = account total - employees*wage
      accounts_obj[employer.account] -= employer.positions * employer.wage;
    }
    
    if (!f_execute) {
      var fail_accounts = {};
      for (var account in accounts_obj) {
        if (accounts_obj[account] < 0) fail_accounts[account] = accounts_obj[account];
      }
      return fail_accounts;
    }
    
    return;
  },
  
  
  
  // admin function to assign jobs, housing, and all other cycled actions for virtual citizens once/week
  weekly_citizen_action_routine: asyncHandler(function (req, res) {
    
    // define internal functions that have access to main function variables:
    
    function remove_citizen_from_job(citizen_id) {
      employed_citizens_obj[citizen_id].employer = null;  // remove citizen reference to employer
      unemployed_citizens_list.push(employed_citizens_obj[citizen_id]);  // copy citizen to unemployed
      delete employed_citizens_obj[citizen_id];  // delete citizen in employed
    }
    
    function home_search(region) {
      var best_price = 1000000;
      var best_home_id = false;
      for (var home_id of home_ids_by_region_status[region]["upgraded"] ) {
        if ((homes_obj[home_id].rent <= (wage / 2)) && (homes_obj[home_id].res_count < homes_obj[home_id].capacity) && (homes_obj[home_id].rent < best_price)) {
          best_home_id = home_id;
          best_price = homes_obj[home_id].rent;
        }
      }
      if (best_home_id) {
        return best_home_id;
      } else {
        for (var home_id of home_ids_by_region_status[region]["regular"] ) {
          if ((homes_obj[home_id].rent <= (wage / 2)) && (homes_obj[home_id].res_count < homes_obj[home_id].capacity) && (homes_obj[home_id].rent < best_price)) {
            best_home_id = home_id;
            best_price = homes_obj[home_id].rent;
          }
        }
      }
      return best_home_id;
    }
    
    function add_employed_citizen_to_home(citizen_id, home_id) {
      homes_obj[home_id].res_count += 1;  // add residents in housing unit
      employed_citizens_obj[citizen_id].home = home_id;  // add citizen reference to home
    }
    
    function remove_employed_citizen_from_home(citizen_id) {
      homes_obj[employed_citizens_obj[citizen_id].home].res_count -= 1;  // reduce residents in housing unit
      employed_citizens_obj[id].home = null;  // remove citizen reference to home
    }
    
    
    
    // check all employers for sufficient funds to pay employees scheduled and adjust if needed
    try { await(this.internal_employer_funds_check(true)); }
    catch(err) { return RespService.e(res, "internal_employer_funds_check error:" + err); };

    // lookup all homes
    try { var homes_list_unprocessed = await(Homes.find({}).populate('hex')); }
    catch(err) { throw new Error('Accounts list db fail: ' + err); }
    // index homes as obj[id] = home
    var homes_obj = {};
    var home_ids_by_region_status = {};
    for (var home of homes_list_unprocessed) {
      homes_obj[home.id] = home;
      if (!home_ids_by_region_status[home.hex.region]) home_ids_by_region_status[home.hex.region] = { upgraded: [], regular: [] };  // create arrays in object
      var type = home.upgraded ? "upgraded" : "regular";
      home_ids_by_region_status[home.hex.region][type].push(home.id);
    }
    
    
    // lookup all citizens
    try { var citizens_list_unprocessed = await(Citizens.find({}).populate('employer')); }
    catch(err) { throw new Error('Accounts list db fail: ' + err); }
    
    // check if each citizen is employed 
    var employed_citizens_obj = {};
    var unemployed_citizens_list = []
    // if it does, add to employed list, otherwise, add to unemployed
    for (var citizen of citizens_list_unprocessed) {
      if (citizen.employer) employed_citizens_obj[citizen.id] = citizen;
      else unemployed_citizens_list.push(citizen);
    } 
    
    
    // lookup all employers
    try { var unprocessed_employers_list = await(Employers.find({}).populate('workers','hex')); }
    catch(err) { throw new Error('Employer search db fail: ' + err); }
    
    // index employers by region and check to see if there were any positions cut
    var employers_obj = {};
    var employer_ids_by_region = {};
    for (var employer of unprocessed_employers_list) {
      if (employer.positions < employer.worker_count) {
        // fire each extra employee
        for (var i=0; i<(employer.worker_count-employer.positions); i++) {
          var employee = employed_citizens_obj[employer.workers[i].id];  // store employee for convenience
          
          homes_obj[employee.home].res_count -= 1;  // reduce residents in housing unit
          employee.home = null;  // remove citizen reference to home
          remove_citizen_from_job(employer.workers[i].id); // make citizen unemployed
        }
        employer.worker_count = employer.positions;  // set the correct worker_count after firing
      }
      employers_obj[employer.id] = employer;
      if (!employer_ids_by_region[employer.hex.region]) employer_ids_by_region[employer.hex.region] = [];  // create array in object
      employer_ids_by_region[employer.hex.region].push(employer.id);  // add ids to array by region for easy lookup later
    }


    // go through each employed person to verify that they can still afford housing
    for (var id in employed_citizens_obj) {
      var wage = employed_citizens_obj[id].employer.wage;
      if (wage < (employed_citizens_obj[id].home.rent / 2)) {
        remove_employed_citizen_from_home(id);  // abandon home and look for new housing
        var best_home_id = home_search(employers_obj[employed_citizens_obj[id].employer.id].hex.region);  // search for new home
        if (best_home_id) add_employed_citizen_to_home(id, best_home_id);  // add new home or
        else remove_citizen_from_job(id);  // make citizen unemployed
      }
    }
    
    
    // create list of open positions across the map
    
    
    // cycle through employed citizens for opportunity to upgrade to a better paying job if pay > +50 AND housing available
    // repeat until nobody changes jobs for a full cycle
    // on job change call helper func to quit job (open position) and other to add job
        // job_search(citizen_obj, region) per region
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

