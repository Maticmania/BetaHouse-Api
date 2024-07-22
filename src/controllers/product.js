import Product from "../models/product.js";
import { cloudinary } from "../configs/cloudinary.config.js";
import { generateUniquePropertyRef } from "../helpers/product.js";

export const createProduct = async (req, res) => {
  try {
    // Destructure and validate required fields
    const {
      title,
      description,
      bedrooms,
      bathrooms,
      toilets,
      street,
      city,
      state,
      category,
      price,
      propertyType
    } = req.body;
    const imageFiles = req.files;

    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: "Title is required" });
    }

    if (
      !description ||
      !bedrooms ||
      !bathrooms ||
      !toilets ||
      !street ||
      !city ||
      !state ||
      !category ||
      !price ||
      !propertyType
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (isNaN(bedrooms) || isNaN(bathrooms) || isNaN(toilets) || isNaN(price)) {
      return res.status(400).json({
        success: false,
        message: "Bedrooms, bathrooms, toilets, and price must be numbers",
      });
    }

    // Validate category
    if (!["Sale", "Rent"].includes(category)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid category. Must be "sale" or "rent"' });
    }

    // Handle image upload
    let uploadedImages = [];

    if (imageFiles && imageFiles.length > 0) {
      uploadedImages = await Promise.all(
        imageFiles.map(async (file) => {
          try {
            const imageResult = await cloudinary.uploader.upload(file.path);
            return {
              url: imageResult.secure_url,
              publicId: imageResult.public_id,
            };
          } catch (err) {
            console.error("Error uploading image to Cloudinary:", err);
            return null; // Skip this image on error
          }
        })
      );

      // Filter out any failed uploads (null values)
      uploadedImages = uploadedImages.filter((image) => image !== null);
    }

    // Generate a unique property reference
    const propertyRef = await generateUniquePropertyRef();

    // Create a new product
    const newProduct = new Product({
      title,
      description,
      bedrooms,
      bathrooms,
      toilets,
      address: { street, city, state },
      images: uploadedImages,
      category,
      price,
      propertyRef,
      propertyType,
      availability: true, // Default availability is true
    });

    // Save the product to the database
    await newProduct.save();
    res.status(201).json({
      success: true,
      message: "Property created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.log("Error creating product", error);
    res
      .status(500)
      .json({ success: false, message: "Error creating property", error });
  }
};


export const getAllProducts = async (req, res) => {
  try {
    // Optionally handle pagination and sorting
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    // Validate sortBy and order parameters
    const validSortByFields = ["title", "price", "createdAt", "updatedAt"];
    if (!validSortByFields.includes(sortBy)) {
      return res.status(400).json({ error: "Invalid sort field" });
    }
    if (!["asc", "desc"].includes(order)) {
      return res.status(400).json({ error: "Invalid sort order" });
    }

    // Calculate pagination skip and limit
    const skip = (page - 1) * limit;
    const limitNumber = parseInt(limit, 10);

    // Find products with pagination and sorting
    const products = await Product.find()
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limitNumber);

    // Get total count for pagination
    const totalCount = await Product.countDocuments();

    res.status(200).json({
      pagination: {
        page: parseInt(page, 10),
        limit: limitNumber,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNumber),
      },
      products,
    });
  } catch (error) {
    console.log("Error getting all products", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error retriving properties information",
        error,
      });
  }
};

export const getProductByIdOrRef = async (req, res) => {
  try {
    const { id, propertyRef } = req.params;

    if (!id && !propertyRef) {
      return res.status(400).json({
        success: false,
        message: "Either id or propertyRef is required",
      });
    }

    // Validate id format if provided
    if (id && !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid id format" });
    }

    // Validate propertyRef format if provided
    if (propertyRef && !/^[\w\-_]{7}$/.test(propertyRef)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid propertyRef format. Must be 7 characters long and can include alphanumeric characters, underscores, and hyphens",
      });
    }

    let product;
    if (id) {
      // Find product by id
      product = await Product.findById(id);
    }
    if (!product && propertyRef) {
      // Find product by propertyRef
      product = await Product.findOne({ propertyRef });
    }

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.log("Error retriving product", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error retriving property information",
        error,
      });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      bedrooms,
      bathrooms,
      toilets,
      street,
      city,
      state,
      category,
      price,
    } = req.body;
    const imageFiles = req.files;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Property id is required" });
    }

    // Validate id format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid id format" });
    }

    let product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    // Update product fields if they are provided
    if (title) product.title = title;
    if (description) product.description = description;
    if (bedrooms) product.bedrooms = bedrooms;
    if (bathrooms) product.bathrooms = bathrooms;
    if (toilets) product.toilets = toilets;
    if (street || city || state) {
      product.address = {
        street: street || product.address.street,
        city: city || product.address.city,
        state: state || product.address.state,
      };
    }
    if (category) product.category = category;
    if (price) product.price = price;
    // Handle image upload and deletion
    if (imageFiles && imageFiles.length > 0) {
      // Delete existing images from Cloudinary
      for (const image of product.images) {
        await cloudinary.uploader.destroy(image.publicId);
      }

      // Upload new images to Cloudinary
      const uploadedImages = await Promise.all(
        imageFiles.map(async (file) => {
          const imageResult = await cloudinary.uploader.upload(file.path);
          return {
            url: imageResult.secure_url,
            publicId: imageResult.public_id,
          };
        })
      );

      // Update the product's images
      product.images = uploadedImages;
    }

    // Save the updated product
    await product.save();
    res.status(200).json({
      success: true,
      message: "Property update successfully",
      product,
    });
  } catch (error) {
    console.log("Error updating", error);
    res.status(500).json({
      success: false,
      message: "Error updating property information",
      error,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate id format
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid id format" });
    }

    // Find the product by id
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "property not found" });
    }

    // Delete images from Cloudinary
    for (const image of product.images) {
      await cloudinary.uploader.destroy(image.publicId);
    }
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error deleting", error);
    res
      .status(500)
      .json({ success: false, message: "Error deleting property", error });
  }
};

export const search = async (req, res) => {
  const { location, propertyType, bedrooms } = req.query;

  try {
    let query = {};

    if (location) {
      query.$or = [
        { "address.city": new RegExp(location, "i") },
        { "address.state": new RegExp(location, "i") }
      ];
    }

    if (propertyType) {
      query.propertyType = new RegExp(propertyType, "i");
    }

    if (bedrooms) {
      query.bedrooms = { $gte: Number(bedrooms) };
    }

    // Perform the search query, limited to 10 results
    const products = await Product.find(query) 
    const productCount = products.length;

    return res.json({
      success: productCount > 0,
      productCount,
      products,
      message: productCount > 0 ? 'Matching products found.' : 'No matching products found.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

