import Imap from 'imap';
import { simpleParser } from 'mailparser';

const gmailUser = 'aayushi@artnovaai.com';
const gmailAppPassword = 'cosx pvew uugv wtwd'; // App password with spaces

async function checkGmailCSV() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('📧 CHECKING GMAIL FOR CSV ATTACHMENTS');
    console.log('='.repeat(80) + '\n');

    console.log('🔐 CONNECTING TO GMAIL IMAP...');
    console.log(`   Email: ${gmailUser}`);
    console.log(`   Password: ${gmailAppPassword.replace(/./g, '*')}`);
    console.log(`   Host: imap.gmail.com:993\n`);

    const imap = new Imap({
      user: gmailUser,
      password: gmailAppPassword,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    });

    return new Promise((resolve, reject) => {
      imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          console.error('❌ Failed to open inbox:', err.message);
          imap.end();
          reject(err);
          return;
        }

        console.log(`✅ INBOX OPENED`);
        console.log(`   Total emails: ${box.messages}\n`);

        // Search for all emails (not just unseen)
        imap.search(['ALL'], async (err, results) => {
          if (err) {
            console.error('❌ Search failed:', err.message);
            imap.end();
            reject(err);
            return;
          }

          if (!results || results.length === 0) {
            console.log('❌ NO EMAILS FOUND\n');
            imap.end();
            resolve([]);
            return;
          }

          console.log(`📨 FOUND ${results.length} EMAILS\n`);

          // Get last 10 emails
          const ids = results.slice(Math.max(results.length - 10, 0));
          const csvEmails: any[] = [];

          const f = imap.fetch(ids, { bodies: '' });

          f.on('message', (msg, seqno) => {
            const chunks: Buffer[] = [];

            msg.on('body', (stream) => {
              stream.on('data', (chunk: Buffer) => chunks.push(chunk));
            });

            msg.once('end', () => {
              const raw = Buffer.concat(chunks);
              simpleParser(raw, {}, async (err, parsed) => {
                if (err) {
                  console.error(`Error parsing email ${seqno}: ${err.message}`);
                  return;
                }

                const subject = parsed.subject || 'No Subject';
                const from = parsed.from?.text || 'Unknown';
                const date = parsed.date?.toISOString() || 'Unknown';

                // Check for CSV attachments
                if (parsed.attachments && parsed.attachments.length > 0) {
                  for (const attachment of parsed.attachments) {
                    if (attachment.filename && attachment.filename.endsWith('.csv')) {
                      const csvContent = attachment.content.toString('utf-8');
                      const lines = csvContent.split('\n').filter(line => line.trim());

                      csvEmails.push({
                        from,
                        subject,
                        date,
                        filename: attachment.filename,
                        size: attachment.size,
                        rows: lines.length - 1, // Exclude header
                        content: csvContent
                      });

                      console.log(`✅ CSV FOUND: ${attachment.filename}`);
                      console.log(`   From: ${from}`);
                      console.log(`   Subject: ${subject}`);
                      console.log(`   Date: ${date}`);
                      console.log(`   Size: ${(attachment.size / 1024).toFixed(2)} KB`);
                      console.log(`   Rows: ${lines.length - 1}\n`);
                    }
                  }
                }
              });
            });
          });

          f.on('error', (err) => {
            console.error('Fetch error:', err);
            imap.end();
            reject(err);
          });

          f.on('end', () => {
            imap.end();

            if (csvEmails.length > 0) {
              console.log('='.repeat(80));
              console.log(`\n📊 LATEST CSV EMAIL:\n`);
              const latest = csvEmails[csvEmails.length - 1];
              console.log(`📧 From: ${latest.from}`);
              console.log(`📋 Subject: ${latest.subject}`);
              console.log(`⏰ Date: ${latest.date}`);
              console.log(`📄 File: ${latest.filename}`);
              console.log(`💾 Size: ${(latest.size / 1024).toFixed(2)} KB`);
              console.log(`👥 Users: ${latest.rows}\n`);

              console.log('📝 PREVIEW - First 3 rows:\n');
              const preview = latest.content.split('\n').slice(0, 3).join('\n');
              console.log(preview);
              console.log('\n' + '='.repeat(80) + '\n');
            } else {
              console.log('❌ NO CSV ATTACHMENTS FOUND IN RECENT EMAILS\n');
            }

            resolve(csvEmails);
          });
        });
      });

      imap.on('error', (err) => {
        console.error('IMAP error:', err.message);
        reject(err);
      });

      imap.on('end', () => {
        console.log('IMAP connection closed');
      });
    });

  } catch (err) {
    console.error('\n❌ ERROR:', err);
  }
}

checkGmailCSV();
