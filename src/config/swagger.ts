export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'E-Commerce Backend API',
    version: '1.0.0',
    description: 'API documentation for the E-Commerce Take-Home Assignment.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local Development Server',
    },
  ],
  paths: {
    '/api/health': {
      get: {
        summary: 'Health Check',
        description: 'Returns the health status of the API.',
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                example: { status: 'ok', timestamp: '2026-06-25T12:00:00.000Z' }
              }
            }
          }
        }
      }
    },
    '/api/cart/{customerId}': {
      get: {
        summary: 'Get Cart',
        description: 'Retrieves the cart for a specific customer.',
        parameters: [
          { name: 'customerId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  data: {
                    id: 'cart-1',
                    userId: 'cust-1',
                    items: [{ productId: 'prod_1', quantity: 2 }]
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/cart/items': {
      post: {
        summary: 'Add Item to Cart',
        description: 'Adds a product to the customer cart or increments quantity.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  customerId: { type: 'string' },
                  productId: { type: 'string' },
                  quantity: { type: 'number' }
                },
                required: ['customerId', 'productId', 'quantity']
              }
            }
          }
        },
        responses: {
          '200': { description: 'Item added successfully' },
          '400': { description: 'Validation Error (e.g. quantity <= 0)' },
          '404': { description: 'Product not found' }
        }
      }
    },
    '/api/cart/items/{productId}': {
      patch: {
        summary: 'Update Cart Item',
        description: 'Updates the quantity of a specific item in the cart. If 0, removes the item.',
        parameters: [
          { name: 'productId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  customerId: { type: 'string' },
                  quantity: { type: 'number' }
                },
                required: ['customerId', 'quantity']
              }
            }
          }
        },
        responses: {
          '200': { description: 'Item updated successfully' },
          '400': { description: 'Validation Error' },
          '404': { description: 'Item or Product not found' }
        }
      },
      delete: {
        summary: 'Remove Cart Item',
        description: 'Removes a specific item from the cart entirely.',
        parameters: [
          { name: 'productId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  customerId: { type: 'string' }
                },
                required: ['customerId']
              }
            }
          }
        },
        responses: {
          '200': { description: 'Item removed successfully' },
          '404': { description: 'Item not found in cart' }
        }
      }
    },
    '/api/checkout': {
      post: {
        summary: 'Process Checkout',
        description: 'Processes the cart, applies optional discount, and creates an order.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  customerId: { type: 'string' },
                  discountCode: { type: 'string' }
                },
                required: ['customerId']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Checkout successful',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  data: {
                    orderId: 'uuid',
                    subtotal: 100,
                    discountAmount: 10,
                    total: 90,
                    items: [{ productId: 'prod_1', quantity: 1, priceAtPurchase: 100 }],
                    appliedCoupon: 'WELCOME10',
                    createdAt: '2026-06-25T12:00:00.000Z'
                  }
                }
              }
            }
          },
          '400': { description: 'Validation Error (Empty cart or used coupon)' },
          '404': { description: 'Invalid coupon or product' }
        }
      }
    },
    '/api/admin/discounts/generate': {
      post: {
        summary: 'Generate Global Discount',
        description: 'Generates a 10% discount code if total global COMPLETED orders are a multiple of 3.',
        responses: {
          '201': {
            description: 'Coupon generated successfully',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  data: {
                    code: 'A1B2C3D4',
                    percentage: 10,
                    used: false,
                    generatedAt: '2026-06-25T12:00:00.000Z'
                  }
                }
              }
            }
          },
          '400': { description: 'Order threshold not met' }
        }
      }
    },
    '/api/admin/stats': {
      get: {
        summary: 'Get Store Stats',
        description: 'Retrieves store analytics computed from COMPLETED orders.',
        responses: {
          '200': {
            description: 'Stats retrieved successfully',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  data: {
                    totalOrders: 10,
                    itemsPurchased: 25,
                    totalRevenue: 1000.50,
                    totalDiscountGiven: 100.00,
                    discountCodes: []
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
