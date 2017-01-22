module.exports = {
  attributes: {
    autoPK: false, // no "id" field for hexes
    name: {  // the PK and externally referenced name of a plot
      type: 'text',
      primaryKey: true,
      unique: true,
      notNull: true,
    },
    direction: {  // east or west side of river
      type: 'string',
      enum: ['E', 'W'],
      notNull: true,
    },
    row: {  // A-closest row to river, H-closest to edge
      type: 'string',
      enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      notNull: true,
    },
    column: {  // on the near side, labeled 1-39/40 left to right
      type: 'integer',
      notNull: true,
    },
    owner: {  // player who owns the hex
      model: 'users',
    },
    region: {  // interconnected region that connects to the hex
      model: 'regions',
    },
    town: {  // town that the hex is under the jurisdiction of
      model: 'governments',
    },
  }
};