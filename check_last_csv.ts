import { fetchNewCsvData } from './src/gmail/inboxReader';
import { config } from './src/config/env';
import fs from 'fs';
import path from 'path';

async function checkLastCSV() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('📧 CHECKING GMAIL FOR CSV ATTACHMENTS');
    console.log('='.repeat(80) + '\n');

    console.log('🔐 GMAIL CONFIGURATION:');
    console.log(`   User: ${config.gmailUser}`);
    console.log(`   Host: imap.gmail.com`);
    console.log(`   Port: 993 (TLS)\n`);

    console.log('⏳ FETCHING CSV DATA FROM GMAIL INBOX...\n');
    const csvContents = await fetchNewCsvData();

    if (csvContents.length === 0) {
      console.log('❌ NO NEW CSV FILES FOUND IN INBOX\n');
      console.log('Checking backed up CSV files...\n');

      const backupDir = path.join(__dirname, 'data/processed');
      if (!fs.existsSync(backupDir)) {
        console.log('❌ No backup directory found\n');
        return;
      }

      const files = fs.readdirSync(backupDir).sort().reverse();

      if (files.length === 0) {
        console.log('❌ No backed up CSV files found\n');
        return;
      }

      console.log(`✅ FOUND ${files.length} BACKED UP CSV FILES:\n`);

      // Show last 5 CSVs
      files.slice(0, 5).forEach((file, index) => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        const date = stats.mtime.toISOString();
        const size = (stats.size / 1024).toFixed(2);

        console.log(`${index + 1}. ${file}`);
        console.log(`   📅 Date: ${date}`);
        console.log(`   💾 Size: ${size} KB\n`);
      });

      console.log(`📋 LAST CSV RECEIVED: ${files[0]}`);
      const lastDate = files[0].match(/_(.+?)\.csv$/)?.[1];
      if (lastDate) {
        const formattedDate = lastDate
          .replace(/-/g, ':')
          .replace(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})-(\d{3})/, '$1-$2-$3 $4:$5:$6');
        console.log(`⏰ TIMESTAMP: ${formattedDate}\n`);
      }

      return;
    }

    console.log(`✅ FOUND ${csvContents.length} NEW CSV FILE(S)\n`);

    csvContents.forEach((content, index) => {
      const lines = content.split('\n');
      const headers = lines[0];
      const rowCount = lines.length - 2; // Exclude header and empty line

      console.log(`CSV #${index + 1}:`);
      console.log(`   📊 Rows: ${rowCount}`);
      console.log(`   📝 Columns: ${headers.split(',').length}`);
      console.log(`   ✅ Status: NEW\n`);
    });

    console.log('='.repeat(80) + '\n');

  } catch (err) {
    console.error('Error:', err);
  }
}

checkLastCSV();
