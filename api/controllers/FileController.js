/**
 * FileController - Test of modules to generate PDF and Excel files
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

/**
 * PDF libraries
 */
const Puppeteer = require('puppeteer')
const ejs = require('ejs')
const fs = require('fs')
const path = require('path')
const ejsPath = path.join(__dirname, '../../files/templateReport.ejs')

/**
 * Excel library: npm i exceljs (just it, nothing else)
 */
const ExcelJS = require('exceljs')
const { getMaxListeners } = require('process')

/**
 * Services to handle requests.
 */
module.exports = {
    generatePDF: async function (req, res) {
        // We generate the PDF with some features with set() method
        printPDF(req, res).then((pdf) => {
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Length': pdf.length
            });
            res.status(200).send(pdf);
        });
        // Observation: the response data of the PDF it's a buffer type.
        // Some browsers will recognize the 'application/pdf' and open it for default with PDF.js (e.g. Chrome/Firefox)
        // Others will not, then we have to convert the buffer data into a .PDF file in the front-end if needed.
    },

    reportExcel: async function (req, res) {

        // Source of data for the proof of concept
        // If the data comes in the frontend request, an example: let data = req.data;
        await Movie.find().then(function(data) {

            // Set the headers of the columns with his keys (needs to match with the data)
            // There's no need to put all columns, just what you need
            // If we can't define columns, then get the headers automatically by: let columns = getHeaders(data);
            // If the columns comes in the frontend request, an example: let columns = req.columns;
            // header: the name for the Excel report - key: the database's attribute name (column), or data attribute of a Json
            // PD: we recommend set here a number format for a column if it's required (numFmt, e.g. numFmt: 'dd/mm/yyyy')
            let columns = [
                { header: 'Nombre', key: 'name' },
                { header: 'Género', key: 'genre', width: 20 }
            ]

            // The styles for the sheet, if we want a better look in the report
            // We recommend set a width for a better appearance of the report (at least 20)
            let styles = {
                alignment: {
                    vertical: 'middle',
                    horizontal: 'center',
                    wrapText: true
                },
                colWidth: 20,
                font: {
                    name: 'Calibri',
                    size: 11,
                    outline: true
                },
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor:{argb:'FFFFE4B5'},
                },
                headerFont: {
                    name: 'Arial',
                    bold: true,
                    size: 12,
                    color: {argb: 'FF000000'}
                },
                headerFill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor:{argb:'FFDAA520'},
                    bgColor: { argb: 'FF0000FF' }
                },
                border: {
                    top: {style:'thin'},
                    left: {style:'thin'},
                    bottom: {style:'thin'},
                    right: {style:'thin'}
                },
            };

            // Create the Excel file (a workbook) with the data, columns of data (headers), styles and width for cells
            // If you don't have columns or styles setted (you can use my recommended styles btw if you need), please use a null value (other value shouldn't work)
            // e.g.: suppose you don't need columns nor styles, then use "generateExcel(data, null, null)"
            const excelFile = generateExcel(data, columns, styles);
            // The function just work with 1 worksheet.
            // If you need more worksheets, it's pretty easy to configure it. Check on: www.npmjs.com/package/exceljs or message me on Twitter: @javierrcanales

            const fileName = 'Reporte.xlsx';

            // Prepare the Excel.xlsx response
            res.status(200);
            res.setHeader('Content-Type', 'text/xlsx');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=${fileName}`
            );

            // Send (write) the data to the client (response)
            excelFile.write(res);
        })
        .catch(err = () => {
            console.log(err);
            return res.status(500).send({err: err});
        });
        // If the styles or columns gives a problem, message me at Twitter: @javierrcanales
    }
};

/**
 * Function to generate an Excel File from:
 * a incoming data, columns (headers) for the data,
 * and styles if needed.
 * @param {*} data : the data for the report (required)
 * @param {*} columns : the columns -headers- we want in our report
 * @param {*} styles : the styles for the excel file, if needed
 * (the JSON's styles require 7 attribute names that I defined: alignment, colWidth, font, fill, headerFont, headerFill, border.
 * More details on the paper and: https://github.com/exceljs/exceljs#styles).
 * @returns : a XLSX Excel file (as a buffer).
 * 
 * Please use "null" if you don't need "columns" nor "styles" (but I recommend use them).
 * e.g.: use "generateExcel(data, null, null)" if it's the case.
 * To use this function you just need this:
 * Run this command in the project: npm i exceljs,
 * and import this on your code: const ExcelJS = require('exceljs');
 * Details of the ExcelJS library at: https://www.npmjs.com/package/exceljs.
 */
function generateExcel (data, columns, styles) {
    
    // Create a new instance of a Workbook class
    let workbook = new ExcelJS.Workbook();
    // Create a new sheet for the workbook (we'll use just 1 sheet)
    let worksheet = workbook.addWorksheet('Reporte');

    // Define columns for the report (if "columns" isn't null)
    if (columns) {
        worksheet.columns = columns;
    }
    else { // If "columns" is null, then get the headers from the data automatically
        let keys = Object.keys(data[0]);

        // Generate headers (as a record, remember the header can be setted manually for a better report's look)
        columns = [];
        keys.forEach(element => {
            columns.push({
                header: element,
                key: element,
                width: 20       //A proper width for the columns
            })
        });
        worksheet.columns = columns;
    }

    // Add the Json data as rows (Obs: this data needs to match with the defined columns)
    worksheet.addRows(data);

    // Set styles to the sheet (if "styles" isn't null)
    if (styles) {
        // Define the column's width for all cells
        if (styles.colWidth) {
            worksheet.properties.defaultColWidth = styles.colWidth;
        }

        // Styles for each rows (the data)
        worksheet.eachRow(function(row, rowNumber) {
            // Iterate over all non-null cells in a row
            row.eachCell(function(cell, colNumber) {
                if (styles.font) {
                    cell.font = styles.font;
                }
                if (styles.alignment) {
                    cell.alignment = styles.alignment;
                }
                if (styles.fill) {
                    cell.fill = styles.fill;
                }
                if (styles.border) {
                    cell.border = styles.border;
                }
            });
        });

        // Styles exclusive for the headers
        worksheet.getRow(1).eachCell(function(cell, colNumber) {
            
            if (styles.alignment) {
                cell.alignment = styles.alignment;
            }
            if (styles.headerFont) {
                cell.font = styles.headerFont;
            }
            if (styles.headerFill) {
                cell.fill = styles.headerFill;
            }
        });
    }
    
    // The Excel file .xlsx
    const excelFile = workbook.xlsx;
    // Finally return the file created
    return excelFile;
}



/**
 * Functions to support the actions of this controller
 */
async function printPDF(req, res) {
    // Charging the EJS template, then render to HTML
    let templateEjs = fs.readFileSync(ejsPath, 'utf8');

    columns = ["name", "age", "car", "branch", "name2", "age2", "car2", "branch2", "name3", "age3", "car3", "branch3"]

    /**
     * Aquí se deberá generar la lógica para separar
     * la data de entrada en trozos que quepan
     * en una sola página HTML.
     */
    const rowsPerPage = 48;

    const dataLength = data.length;
    console.log("datalength: "+dataLength)
    const pages = Math.ceil(dataLength/rowsPerPage);
    console.log("pages: "+pages)
    let finalData = [];

    if (pages > 1) {
        for(i=0; i < pages; i++) {
            finalData.push(data.slice(rowsPerPage*i, rowsPerPage*(i+1)));
        }
    } else {
        finalData.push(data);
    }

    let html;
    // Creates the HTML passing the request data (as example)
    html = ejs.render(templateEjs, {
        columns: columns,
        dataArray: finalData
    });
    

    // Start the puppeteer API, headless
    const browser = await Puppeteer.launch({ headless: true, args: ['--no-sandbox'] }); //instanciar arriba
    const page = await browser.newPage();

    // Set the HTML to the puppeteer page, then the PDF (buffer) it's generated with some options
    await page.setContent(html);
    await page.addStyleTag({path: 'files/style.css'})
    const pdf = await page.pdf({
        format: 'A4',
        printBackground: true
    });

    // Close the puppeteer API and return the PDF buffer
    await browser.close();
    return pdf;
}

data3 = [
    { 
        "name": "John", 
        "age": 30, 
        "car": "Mazda 3" 
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    },
    { 
        "name": "Johne", 
        "age": 31, 
        "car": "Tiida"
    }]

    data2 = [
        { 
            "name": "John", 
            "age": 30, 
            "car": "Mazda 3" 
        },
        { 
            "name": "Johne", 
            "age": 31, 
            "car": "Tiida"
        },
        { 
            "name": "Johne", 
            "age": 31, 
            "car": "Tiida"
        },
        { 
            "name": "Johne", 
            "age": 31, 
            "car": "Tiida"
        },
        { 
            "name": "Johne", 
            "age": 31, 
            "car": "Tiida"
        },
        { 
            "name": "Johne", 
            "age": 31, 
            "car": "Tiida"
        },
        { 
            "name": "Johne", 
            "age": 31, 
            "car": "Tiida"
        },
        { 
            "name": "Johne", 
            "age": 31, 
            "car": "Tiida"
        },
        { 
            "name": "Johne", 
            "age": 31, 
            "car": "Tiida"
        },
        { 
            "name": "Johne", 
            "age": 31, 
            "car": "Tiida"
        },
        { 
            "name": "Johne", 
            "age": 31, 
            "car": "Tiida"
        }]

        data = [
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
            { 
                "name": "Johne", 
                "age": 31, 
                "car": "Tiida",
                "branch": "Nissan",
                "name2": "Johne", 
                "age2": 31, 
                "car2": "Tiida",
                "branch2": "Nissan",
                "name3": "Johne", 
                "age3": 31, 
                "car3": "Tiida",
                "branch3": "Nissan"
            },
        ]
    