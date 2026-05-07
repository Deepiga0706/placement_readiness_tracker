export type Question = {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  marks?: number;
  estTime?: number; // seconds
};

const makeId = (prefix: string, n: number) => `${prefix}-${n}`;

export const BANK: Record<string, Question[]> = {
  DSA: [
    { id: makeId('dsa',1), prompt: 'What is the time complexity of binary search on a sorted array?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], answer: 'O(log n)', difficulty: 'Easy', topic: 'Arrays', marks: 5, estTime: 60 },
    { id: makeId('dsa',2), prompt: 'Which data structure is best for implementing LRU cache?', options: ['Array','Linked List + Hash Map','Stack','Queue'], answer: 'Linked List + Hash Map', difficulty: 'Medium', topic: 'Hashing', marks: 10, estTime: 180 },
    { id: makeId('dsa',3), prompt: 'Which traversal of a tree gives nodes in non-decreasing order for a BST?', options: ['Preorder','Inorder','Postorder','Level-order'], answer: 'Inorder', difficulty: 'Easy', topic: 'Trees', marks: 5, estTime: 90 },
    { id: makeId('dsa',4), prompt: 'Which algorithm is used to find shortest path in graphs with non-negative weights?', options: ['Bellman-Ford','Dijkstra','Floyd-Warshall','Kruskal'], answer: 'Dijkstra', difficulty: 'Medium', topic: 'Graphs', marks: 10, estTime: 180 },
    { id: makeId('dsa',5), prompt: 'Dynamic Programming reduces time complexity by using ?', options: ['Recursion only','Memoization or Tabulation','Greedy heuristics','Divide and Conquer'], answer: 'Memoization or Tabulation', difficulty: 'Easy', topic: 'DP', marks: 5, estTime: 120 }
  ],
  DBMS: [
    { id: makeId('dbms',1), prompt: 'Which normal form eliminates transitive dependencies?', options: ['1NF','2NF','3NF','BCNF'], answer: '3NF', difficulty: 'Easy', topic: 'Normalization', marks: 5, estTime: 90 },
    { id: makeId('dbms',2), prompt: 'ACID property that ensures transactions are permanent is ?', options: ['Atomicity','Consistency','Isolation','Durability'], answer: 'Durability', difficulty: 'Medium', topic: 'Transactions', marks: 10, estTime: 120 }
  ],
  OS: [
    { id: makeId('os',1), prompt: 'Which scheduling algorithm is preemptive?', options: ['FCFS','SJF (non-preemptive)','Round Robin','None'], answer: 'Round Robin', difficulty: 'Easy', topic: 'Scheduling', marks: 5, estTime: 90 }
  ],
  CN: [
    { id: makeId('cn',1), prompt: 'Which protocol is used to resolve domain names to IP addresses?', options: ['HTTP','TCP','DNS','ARP'], answer: 'DNS', difficulty: 'Easy', topic: 'DNS', marks: 5, estTime: 60 }
  ]
};

export default BANK;
