import { NextRequest } from 'next/server'
import { ProductHandlers } from '@/domains/products'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return ProductHandlers.calculateProductPrice(id, request)
}

function calculateWithFormula(formula: string, config: any, basePrice: number): number {
  try {
    // Simple formula evaluator - replace variables with values
    let expression = formula
    
    // Replace common variables
    if (config.width) expression = expression.replace(/width/g, config.width.toString())
    if (config.height) expression = expression.replace(/height/g, config.height.toString())
    if (config.length) expression = expression.replace(/length/g, config.length.toString())
    if (config.area) expression = expression.replace(/area/g, config.area.toString())
    if (config.quantity) expression = expression.replace(/quantity/g, config.quantity.toString())
    
    expression = expression.replace(/basePrice/g, basePrice.toString())
    
    // Simple math evaluation (be careful in production - this is just for demo)
    // In production, use a proper math expression parser
    const result = Function(`"use strict"; return (${expression})`)()
    
    return Number(result) || basePrice
  } catch (error) {
    console.error('Formula calculation error:', error)
    return basePrice
  }
}

function findMatchingVariant(variants: any[], configuration: any) {
  return variants.find(variant => {
    const variantConfig = variant.configuration
    return Object.keys(configuration).every(key => 
      variantConfig[key] === configuration[key]
    )
  })
}

function calculateAttributeModifiers(attributes: any[], configuration: any) {
  let priceModifier = 0
  let costModifier = 0
  
  console.log('🔍 Calculating attribute modifiers for:', Object.keys(configuration))
  
  attributes.forEach(attribute => {
    const selectedValue = configuration[attribute.name.toLowerCase()]
    console.log(`📋 Attribute ${attribute.name}: looking for value "${selectedValue}"`)
    
    if (selectedValue && attribute.options) {
      const option = attribute.options.find((opt: any) => opt.value === selectedValue)
      console.log(`🔎 Found option:`, option ? { value: option.value, priceModifier: option.priceModifier } : 'NOT FOUND')
      
      if (option) {
        priceModifier += Number(option.priceModifier || 0)
        costModifier += Number(option.costModifier || 0)
      }
    }
  })
  
  console.log('🏷️ Total modifiers:', { price: priceModifier, cost: costModifier })
  return { price: priceModifier, cost: costModifier }
}

function validateRequiredAttributes(attributes: any[], configuration: any): string[] {
  const missing: string[] = []
  
  attributes
    .filter(attr => attr.isRequired)
    .forEach(attr => {
      const value = configuration[attr.name.toLowerCase()]
      if (!value) {
        missing.push(attr.name)
      }
    })
  
  return missing
}