const { client, connectDB } = require('./config/db');

const cleanup = async () => {
    try {
        await connectDB();
        console.log('Cleaning up duplicate exams...');

        // Find duplicate exam titles
        const duplicatesRes = await client.execute(`
            SELECT title, COUNT(*) as count 
            FROM exams 
            GROUP BY title 
            HAVING count > 1
        `);

        for (const dup of duplicatesRes.rows) {
            console.log(`Fixing duplicate: ${dup.title}`);
            // Keep the earliest one, delete others
            const allRes = await client.execute({
                sql: 'SELECT id FROM exams WHERE title = ? ORDER BY created_at ASC',
                args: [dup.title]
            });
            
            const idsToDelete = allRes.rows.slice(1).map(r => r.id);
            for (const id of idsToDelete) {
                // Delete questions and attempts first to maintain integrity
                await client.execute({ sql: 'DELETE FROM questions WHERE exam_id = ?', args: [id] });
                await client.execute({ sql: 'DELETE FROM attempts WHERE exam_id = ?', args: [id] });
                await client.execute({ sql: 'DELETE FROM exams WHERE id = ?', args: [id] });
            }
        }

        console.log('✅ Cleanup complete. All exams are now unique.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during cleanup:', error.message);
        process.exit(1);
    }
};

cleanup();
