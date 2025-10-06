import type { 
  DataDrivenComponentInputs, 
  DataDrivenComponentDefinition, 
  DataDrivenComponentResult 
} from "../common/types.js";

export class DataDrivenComponentTester {
  private static readonly componentDefinitions: Record<string, DataDrivenComponentDefinition> = {
    chart: {
      title: "Bar Chart Component",
      description: "A React component that renders a bar chart from data props",
      component: `import React from 'react';

const BarChart = ({ data, title, width = 400, height = 300 }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div>
      <h3>{title}</h3>
      <svg width={width} height={height} style={{ border: '1px solid #ccc' }}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height - 40);
          const barWidth = (width - 40) / data.length - 10;
          const x = 20 + index * (barWidth + 10);
          const y = height - 20 - barHeight;
          
          return (
            <g key={item.name}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#3498db"
              />
              <text
                x={x + barWidth/2}
                y={height - 5}
                textAnchor="middle"
                fontSize="12"
              >
                {item.name}
              </text>
              <text
                x={x + barWidth/2}
                y={y - 5}
                textAnchor="middle"
                fontSize="10"
              >
                {item.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default BarChart;`,
      usage: `<BarChart 
  data={[
    { name: 'A', value: 30 },
    { name: 'B', value: 50 },
    { name: 'C', value: 20 }
  ]}
  title="Sales Data"
  width={500}
  height={300}
/>`,
      sampleData: [
        { name: 'A', value: 30 },
        { name: 'B', value: 50 },
        { name: 'C', value: 20 }
      ],
      dataStructure: `{
  name: string;
  value: number;
}[]`
    },

    table: {
      title: "Data Table Component",
      description: "A React component that renders a table from data props",
      component: `import React from 'react';

const DataTable = ({ data, columns, title }) => {
  return (
    <div>
      <h3>{title}</h3>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            {columns.map(col => (
              <th key={col.key} style={{ border: '1px solid #ddd', padding: '8px' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {columns.map(col => (
                <td key={col.key} style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;`,
      usage: `<DataTable 
  data={[
    { id: 1, name: 'John', age: 25, city: 'Seoul' },
    { id: 2, name: 'Jane', age: 30, city: 'Busan' }
  ]}
  columns={[
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' },
    { key: 'city', label: 'City' }
  ]}
  title="User List"
/>`,
      sampleData: [
        { id: 1, name: 'John', age: 25, city: 'Seoul' },
        { id: 2, name: 'Jane', age: 30, city: 'Busan' }
      ],
      dataStructure: `{
  data: Record<string, any>[];
  columns: { key: string; label: string }[];
  title: string;
}`
    },

    list: {
      title: "User List Component",
      description: "A React component that renders a user list from data props",
      component: `import React from 'react';

const UserList = ({ users, onUserClick }) => {
  return (
    <div>
      <h3>Users ({users.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {users.map(user => (
          <div
            key={user.id}
            onClick={() => onUserClick?.(user)}
            style={{
              padding: '15px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: '#f9f9f9'
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{user.name}</div>
            <div style={{ color: '#666', fontSize: '14px' }}>
              {user.email} • {user.role}
            </div>
            <div style={{ color: '#999', fontSize: '12px' }}>
              Last active: {user.lastActive}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;`,
      usage: `<UserList 
  users={[
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', lastActive: '2 hours ago' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', lastActive: '1 day ago' }
  ]}
  onUserClick={(user) => console.log('Clicked user:', user)}
/>`,
      sampleData: [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', lastActive: '2 hours ago' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', lastActive: '1 day ago' }
      ],
      dataStructure: `{
  id: number;
  name: string;
  email: string;
  role: string;
  lastActive: string;
}[]`
    },

    card: {
      title: "Product Card Component",
      description: "A React component that renders product cards from data props",
      component: `import React from 'react';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      width: '250px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <img 
        src={product.image} 
        alt={product.name}
        style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }}
      />
      <h4 style={{ margin: '10px 0 5px 0' }}>{product.name}</h4>
      <p style={{ color: '#666', fontSize: '14px', margin: '0 0 10px 0' }}>
        {product.description}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#e74c3c' }}>
          {'$' + product.price}
        </span>
        <button
          onClick={() => onAddToCart?.(product)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add to Cart
        </button>
      </div>
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
        Stock: {product.stock} • Rating: {product.rating}/5
      </div>
    </div>
  );
};

const ProductGrid = ({ products, onAddToCart }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
      {products.map(product => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
};

export default ProductGrid;`,
      usage: `<ProductGrid 
  products={[
    { 
      id: 1, 
      name: 'Laptop', 
      description: 'High-performance laptop', 
      price: 999, 
      image: 'https://example.com/laptop.jpg',
      stock: 5,
      rating: 4.5
    }
  ]}
  onAddToCart={(product) => console.log('Added to cart:', product)}
/>`,
      sampleData: [
        { 
          id: 1, 
          name: 'Laptop', 
          description: 'High-performance laptop', 
          price: 999, 
          image: 'https://example.com/laptop.jpg',
          stock: 5,
          rating: 4.5
        }
      ],
      dataStructure: `{
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  rating: number;
}[]`
    }
  };

  private static readonly testQuestions = [
    "Can you understand how the component uses the data props?",
    "Can you identify the data structure and how it's rendered?",
    "Can you explain the relationship between props and component output?",
    "Can you suggest how to modify the component for different data types?",
    "Can you create a similar component that works with different data structures?"
  ];

  public static generateTest(inputs: DataDrivenComponentInputs): DataDrivenComponentResult {
    const { dataType = "all" } = inputs;
    
    let selectedComponents: DataDrivenComponentDefinition[] = [];
    
    if (dataType === "all") {
      selectedComponents = Object.values(this.componentDefinitions);
    } else {
      const component = this.componentDefinitions[dataType];
      if (component) {
        selectedComponents = [component];
      }
    }

    return {
      components: selectedComponents,
      testQuestions: this.testQuestions
    };
  }

  public static formatTestResult(result: DataDrivenComponentResult): string {
    const { components, testQuestions } = result;

    return `# Data-Driven React Component Test Results

## Test Purpose
This tool provides React components that work with data props to test Claude's understanding of data-driven component patterns.

## Components Provided:

${components.map((comp, index) => `
### ${index + 1}. ${comp.title}
**Description:** ${comp.description}

**Component Code:**
\`\`\`tsx
${comp.component}
\`\`\`

**Usage Example:**
\`\`\`tsx
${comp.usage}
\`\`\`

**Sample Data Structure:**
\`\`\`typescript
${comp.dataStructure}
\`\`\`

**Sample Data:**
\`\`\`json
${JSON.stringify(comp.sampleData, null, 2)}
\`\`\`

---
`).join('')}

## Test Questions for Claude:
${testQuestions.map((question, index) => `${index + 1}. ${question}`).join('\n')}

Please analyze these data-driven components and explain how they process and display the provided data.`;
  }
}

export async function testDataDrivenComponents(inputs: DataDrivenComponentInputs): Promise<string> {
  const result = DataDrivenComponentTester.generateTest(inputs);
  return DataDrivenComponentTester.formatTestResult(result);
}
