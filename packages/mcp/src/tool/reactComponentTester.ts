import type { ReactComponentTestInputs, ReactComponentDefinition, ReactComponentTestResult } from "../common/types.js";

export class ReactComponentTester {
  private static readonly componentDefinitions: Record<string, ReactComponentDefinition> = {
    simple: {
      title: "Simple Button Component",
      description: "A basic React button component",
      component: `import React from 'react';

const Button = ({ children, onClick }) => {
  return (
    <button onClick={onClick} style={{ padding: '10px 20px' }}>
      {children}
    </button>
  );
};

export default Button;`,
      usage: `<Button onClick={() => console.log('clicked')}>
  Click me
</Button>`
    },
    
    medium: {
      title: "Counter Component",
      description: "A React component with state",
      component: `import React, { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
    </div>
  );
};

export default Counter;`,
      usage: `<Counter />`
    },

    complex: {
      title: "Todo List Component",
      description: "A React component with multiple state and effects",
      component: `import React, { useState, useEffect } from 'react';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, done: false }]);
      setInput('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  return (
    <div>
      <input 
        value={input} 
        onChange={(e) => setInput(e.target.value)}
        placeholder="Add todo..."
      />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(todo => (
          <li 
            key={todo.id}
            onClick={() => toggleTodo(todo.id)}
            style={{ textDecoration: todo.done ? 'line-through' : 'none' }}
          >
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;`,
      usage: `<TodoList />`
    }
  };

  private static readonly testQuestions = [
    "Can you understand the component structure and purpose?",
    "Can you identify the props, state, and side effects?",
    "Can you explain how the component works?",
    "Can you suggest improvements or modifications?",
    "Can you create similar components based on this pattern?"
  ];

  public static generateTest(inputs: ReactComponentTestInputs): ReactComponentTestResult {
    const { complexity = "simple" } = inputs;
    
    let selectedComponents: ReactComponentDefinition[] = [];
    
    if (complexity === "all") {
      selectedComponents = Object.values(this.componentDefinitions);
    } else {
      const component = this.componentDefinitions[complexity];
      if (component) {
        selectedComponents = [component];
      }
    }

    return {
      components: selectedComponents,
      testQuestions: this.testQuestions
    };
  }

  public static formatTestResult(result: ReactComponentTestResult): string {
    const { components, testQuestions } = result;

    return `# React Component Test Results

## Test Purpose
This tool provides React components of varying complexity to test Claude's understanding capabilities.

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

---
`).join('')}

## Test Questions for Claude:
${testQuestions.map((question, index) => `${index + 1}. ${question}`).join('\n')}

Please analyze these components and provide your understanding of their functionality.`;
  }
}

export async function testReactComponents(inputs: ReactComponentTestInputs): Promise<string> {
  const result = ReactComponentTester.generateTest(inputs);
  return ReactComponentTester.formatTestResult(result);
}
