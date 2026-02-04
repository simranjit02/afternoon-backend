# E-Commerce Backend API

A Node.js/Express backend server for the e-commerce application with MongoDB integration.

## Features

- RESTful API for product management
- MongoDB database integration
- CRUD operations for products
- Filter by category
- Seed script for database initialization

## Setup

### Prerequisites
- Node.js and npm installed
- MongoDB Atlas account or local MongoDB instance

### Installation

1. Clone the repository
```bash
git clone https://github.com/simranjit02/afternoon-backend.git
cd e-commerce-backend
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file from `.env.example`
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB connection string
```
MONGODB_URI=mongodb+srv://username:password@cluster-name.mongodb.net/furnitureClg?retryWrites=true&w=majority
PORT=5000
```

5. Seed the database
```bash
npm run seed
```

6. Start the server
```bash
npm run dev
```

## API Endpoints

### Products

- **GET** `/api/products` - Get all products
- **GET** `/api/products/:id` - Get product by ID
- **GET** `/api/products/category/:category` - Get products by category
- **POST** `/api/products` - Create new product
- **PUT** `/api/products/:id` - Update product
- **DELETE** `/api/products/:id` - Delete product

## Example Usage

```bash
# Get all products
curl http://localhost:5000/api/products

# Get products by category
curl http://localhost:5000/api/products/category/Furniture

# Create product
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Sofa",
    "productPrice": "85.00",
    "productCategory": "Furniture"
  }'
```

## License

ISC
