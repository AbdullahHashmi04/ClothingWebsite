import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  // longDescription: {
  //   type: String
  // },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0
  },
  imageUrl: {
    type: String
  },
  images: [{
    type: String
  }],
  originalPrice: {
    type: Number,
    min: 0
  },
  discountMeta: {
    discountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discount'
    },
    code: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    },
    value: {
      type: Number,
      default: 0
    },
    appliedAt: {
      type: Date
    }
  },
  category: {
    type: String,
    required: true,
    enum: ['shirts', 'pants', 'Jeans','dresses', 'jackets', 'shoes', 'accessories', 'other', 'men', 'women', 'kids']
  },
  // additionalImages: [{
  //   type: String
  // }],
  // sizes: [{
  //   type: String,
  //   enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL']
  // }],
  // colors: [{
  //   type: String
  // }],
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  // tryOnEnabled: {
  //   type: Boolean,
  //   default: true
  // },
  // features: [{
  //   type: String
  // }],
  // materials: {
  //   type: String
  // },
  // careInstructions: {
  //   type: String
  // },
  // brand: {
  //   type: String
  // },
  // rating: {
  //   type: Number,
  //   min: 0,
  //   max: 5,
  //   default: 0
  // },
  // reviewCount: {
  //   type: Number,
  //   default: 0
  // },
  // isActive: {
  //   type: Boolean,
  //   default: true
  // },
  // createdBy: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User'
  // }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ price: 1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Ensure virtuals are included when converting to JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
