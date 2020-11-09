/**
 * Movie.js
 *
 * A user who can log in to this application.   
 */
module.exports = {
    
    tableName: 'movie',
    attributes: {
      id: { 
          type: 'number',
          columnType: 'int',
          required: true
      },
      name: { 
        type: 'string',
        columnType: 'varchar(1024)',
        required: false 
      },
      genre: { 
        type: 'string',
        columnType: 'varchar(1024)',
        required: false 
      },
      
        /**********************************
         * Fields standard for all Tables
         ***********************************/
      createdAt: {
          type: 'ref',
          columnType: 'DateTime',
          autoCreatedAt: true
      },
      updatedAt: {
          type: 'ref',
          columnType: 'DateTime',
          autoUpdatedAt: true
      },
    },
};