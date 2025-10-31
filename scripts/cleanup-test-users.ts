import { db } from '@/db/drizzle'
import { user, session, verification, account } from '@/db/schema'
import { eq, like, or } from 'drizzle-orm'

async function cleanupTestUsers() {
  console.log('🧹 Cleaning up test users...\n')

  try {
    // Define test email patterns to remove
    const testEmails = [
      'stevethead@gmail.com',
      'stevethehead@gmail.com',
      'stephenlewisroberts@gmail.com',
      'stephenlewisroberts82@gmail.com',
    ]

    // First, let's see what users we have
    console.log('📋 Current users in database:')
    const allUsers = await db.select({
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    }).from(user)

    allUsers.forEach(u => {
      console.log(`  - ${u.email} (${u.name || 'no name'}) - ${u.emailVerified ? 'verified' : 'not verified'}`)
    })
    console.log('')

    // Find all test users (including those with 'test' in email)
    const usersToDelete = await db.select()
      .from(user)
      .where(
        or(
          ...testEmails.map(email => eq(user.email, email)),
          like(user.email, '%test%')
        )
      )

    if (usersToDelete.length === 0) {
      console.log('✅ No test users found to delete!')
      return
    }

    console.log(`🎯 Found ${usersToDelete.length} test user(s) to delete:`)
    usersToDelete.forEach(u => console.log(`  - ${u.email}`))
    console.log('')

    // Delete related data for each user
    for (const testUser of usersToDelete) {
      console.log(`🗑️  Deleting data for: ${testUser.email}`)

      // Delete sessions
      const deletedSessions = await db.delete(session)
        .where(eq(session.userId, testUser.id))
      console.log(`   ✓ Deleted sessions`)

      // Delete verifications
      const deletedVerifications = await db.delete(verification)
        .where(eq(verification.identifier, testUser.email))
      console.log(`   ✓ Deleted verifications`)

      // Delete accounts (OAuth, etc.)
      const deletedAccounts = await db.delete(account)
        .where(eq(account.userId, testUser.id))
      console.log(`   ✓ Deleted accounts`)

      // Finally delete the user
      await db.delete(user)
        .where(eq(user.id, testUser.id))
      console.log(`   ✓ Deleted user record`)
      console.log('')
    }

    console.log('✅ Cleanup complete!')
    console.log('\n📋 Remaining users:')
    const remainingUsers = await db.select({
      email: user.email,
      name: user.name,
    }).from(user)

    if (remainingUsers.length === 0) {
      console.log('  (no users remaining)')
    } else {
      remainingUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.name || 'no name'})`)
      })
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    process.exit(1)
  }
}

cleanupTestUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
