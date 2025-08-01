// Define which components should be optimized by Million.js

import { block, fragment, For } from 'million/react';

// Use these in your components. For example:
// export default block(MyComponent);
// 
// Or for components that render lists:
// export default function MyListComponent({ items }) {
//   return (
//     <For each={items} as="ul">
//       {(item) => <li key={item.id}>{item.name}</li>}
//     </For>
//   );
// }
//
// For fragments:
// export default fragment(MyComponent);

export { block, fragment, For };
