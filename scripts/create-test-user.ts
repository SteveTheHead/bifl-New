import { auth } from '@/lib/auth'

async function createTestUser() {
  try {
    // Create a test user for reviewing
    const testUser = await auth.api.signUpEmail({
      body: {
        email: 'testuser@bifl.dev',
        password: 'TestUser123!',
        name: 'Test User'
      }
    })

    console.log('✅ Test user created successfully:', testUser)
    console.log('📧 Email: testuser@bifl.dev')
    console.log('🔑 Password: TestUser123!')

  } catch (error) {
    console.error('❌ Error creating test user:', error)
  }
}

// Run the script
createTestUser()