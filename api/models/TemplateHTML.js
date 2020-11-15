/**
 * TemplateHTML.js
 *
 * A template HTML. 
 */
module.exports = {
    
    tableName: 'template_html',
    attributes: {
      id: { 
          type: 'number',
          columnType: 'int',
          required: true
      },
      name: { 
        type: 'string',
        columnType: 'varchar(8)',
        required: true 
      },
      html: { 
        type: 'string',
        columnType: 'varchar(4096)',
        required: true
      }

        /**********************************
         * Fields standard for all Tables
         ***********************************/
        /*
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
      */
    },
};