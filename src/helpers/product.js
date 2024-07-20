import Product from "../models/product.js";
import { nanoid } from 'nanoid';  // Install nanoid if not already: npm install nanoid

// Helper function to generate a unique property reference
export const generateUniquePropertyRef = async () => {
    let unique = false;
    let propertyRef;
  
    while (!unique) {
      // Generate a random 7-character alphanumeric string
      propertyRef = nanoid(7);
  
      // Check if the propertyRef already exists in the database
      const existingProduct = await Product.findOne({ propertyRef });
      if (!existingProduct) {
        unique = true;  // Unique propertyRef found
      }
    }
  
    return propertyRef;
  };