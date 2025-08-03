// Test script to verify UPVC Window calculation
const fetch = require('node-fetch')

async function testCalculation() {
  try {
    // First, let's get the UPVC Window product ID
    const productsResponse = await fetch('http://localhost:3001/api/products', {
      headers: {
        'Cookie': 'demo=true', // Add demo auth cookie
      }
    })
    const productsData = await productsResponse.json()
    const upvcWindow = productsData.data?.find(p => p.name === 'UPVC Window')
    
    if (!upvcWindow) {
      console.log('UPVC Window not found')
      return
    }
    
    console.log('Found UPVC Window:', upvcWindow.id, upvcWindow.name)
    console.log('Base Price:', upvcWindow.basePrice)
    console.log('Formula:', upvcWindow.calculationFormula)
    console.log('Attributes:', upvcWindow.attributes?.map(a => a.name))
    
    // Test configuration matching the user's screenshot
    const testConfig = {
      width: 120,
      height: 125,
      material: 'Wood',      // Note: option value is 'Wood', displayName is 'Wooden'
      glass: 'Triple'        // Note: option value is 'Triple', displayName is 'Triple Glazing'
    }
    
    console.log('\nTesting calculation with config:', testConfig)
    
    const calcResponse = await fetch(`http://localhost:3001/api/products/${upvcWindow.id}/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'demo=true',
      },
      body: JSON.stringify({
        configuration: testConfig,
        quantity: 1
      })
    })
    
    const calcData = await calcResponse.json()
    console.log('\nCalculation result:', calcData)
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testCalculation()