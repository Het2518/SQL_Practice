export const ecommerceInfo = {

    name: 'ecommerce',
    label: 'E-Commerce',
    description: 'Customers, products, orders, payments, reviews, and shipping. Perfect for revenue analysis, funnels, and product hierarchies.',
    icon: '🛒',
    tableCount: 8,
    questionCount: 60,
    concepts: ['Revenue Analysis', 'Funnel Queries', 'CTEs', 'Product Hierarchies'],
    tables: [
      {
        "name": "categories",
        "rowCount": 15,
        "columns": [
          {
            "name": "category_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "name",
            "type": "TEXT"
          },
          {
            "name": "parent_category_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "categories",
            "isNullable": true
          }
        ]
      },
      {
        "name": "customers",
        "rowCount": 100,
        "columns": [
          {
            "name": "customer_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "first_name",
            "type": "TEXT"
          },
          {
            "name": "last_name",
            "type": "TEXT"
          },
          {
            "name": "email",
            "type": "TEXT"
          },
          {
            "name": "phone",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "city",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "country",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "registered_at",
            "type": "DATE",
            "isNullable": true
          }
        ]
      },
      {
        "name": "suppliers",
        "rowCount": 0,
        "columns": [
          {
            "name": "supplier_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "company_name",
            "type": "TEXT"
          },
          {
            "name": "contact_email",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "country",
            "type": "TEXT",
            "isNullable": true
          }
        ]
      },
      {
        "name": "products",
        "rowCount": 80,
        "columns": [
          {
            "name": "product_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "name",
            "type": "TEXT"
          },
          {
            "name": "description",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "price",
            "type": "REAL"
          },
          {
            "name": "stock_qty",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "category_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "categories",
            "isNullable": true
          },
          {
            "name": "supplier_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "suppliers",
            "isNullable": true
          }
        ]
      },
      {
        "name": "orders",
        "rowCount": 150,
        "columns": [
          {
            "name": "order_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "customer_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "customers"
          },
          {
            "name": "order_date",
            "type": "DATE"
          },
          {
            "name": "status",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "shipping_address",
            "type": "TEXT",
            "isNullable": true
          }
        ]
      },
      {
        "name": "order_items",
        "rowCount": 350,
        "columns": [
          {
            "name": "item_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "order_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "orders"
          },
          {
            "name": "product_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "products"
          },
          {
            "name": "quantity",
            "type": "INTEGER"
          },
          {
            "name": "unit_price",
            "type": "REAL"
          }
        ]
      },
      {
        "name": "payments",
        "rowCount": 130,
        "columns": [
          {
            "name": "payment_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "order_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "orders"
          },
          {
            "name": "amount",
            "type": "REAL"
          },
          {
            "name": "method",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "paid_at",
            "type": "DATETIME",
            "isNullable": true
          },
          {
            "name": "status",
            "type": "TEXT",
            "isNullable": true
          }
        ]
      },
      {
        "name": "reviews",
        "rowCount": 120,
        "columns": [
          {
            "name": "review_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "product_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "products"
          },
          {
            "name": "customer_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "customers"
          },
          {
            "name": "rating",
            "type": "INTEGER",
            "isNullable": true
          },
          {
            "name": "body",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "reviewed_at",
            "type": "DATE",
            "isNullable": true
          }
        ]
      },
      {
        "name": "shipping",
        "rowCount": 130,
        "columns": [
          {
            "name": "shipment_id",
            "type": "INTEGER",
            "isPrimaryKey": true
          },
          {
            "name": "order_id",
            "type": "INTEGER",
            "isForeignKey": true,
            "references": "orders"
          },
          {
            "name": "carrier",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "tracking_no",
            "type": "TEXT",
            "isNullable": true
          },
          {
            "name": "shipped_at",
            "type": "DATETIME",
            "isNullable": true
          },
          {
            "name": "delivered_at",
            "type": "DATETIME",
            "isNullable": true
          }
        ]
      }
    ]

};
