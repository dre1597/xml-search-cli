#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { Command } = require('commander');

const program = new Command();

const inputFolder = path.join(__dirname, '../assets/input');
const outputFolder = path.join(__dirname, '../assets/output');

program
  .version('1.0.0')
  .description('Search for a string in XML files and copy matching files to the output folder')
  .arguments('<searchString>')
  .action(async (searchString) => {
    try {
      const files = await promisify(fs.readdir)(inputFolder);

      for (const file of files) {
        if (path.extname(file).toLowerCase() === '.xml') {
          const filePath = path.join(inputFolder, file);
          const containsString = await checkForString(filePath, searchString);

          if (containsString) {
            await copyFile(filePath, outputFolder);
            console.log(`String found in ${file}. File copied to ${outputFolder}`);
          }
        }
      }
    } catch (error) {
      console.error('Error reading or copying files:', error.message);
    }
  });

program.parse(process.argv);

async function checkForString(file, searchString) {
  try {
    const fileContent = await promisify(fs.readFile)(file, 'utf-8');
    return fileContent.includes(searchString);
  } catch (error) {
    console.error(`Error reading ${file}:`, error.message);
    return false;
  }
}

async function copyFile(source, destinationFolder) {
  const fileName = path.basename(source);
  const destination = path.join(destinationFolder, fileName);

  return promisify(fs.copyFile)(source, destination);
}
