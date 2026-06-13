import { AnyARecord } from 'dns';
import { starterCodesBySlug } from './seed-starter-codes';

export interface ProblemSeed {
  slug: string;
  title: string;
  statement: string;
  difficulty: any;
  tags: string[];
  constraints: string;
  starterCode: Record<string, string>;
  hints: string[];
  xpReward: number;
  order: number;
  examples: { input: string; output: string; explanation: string; order: number }[];
  testCases: { input: string; expected: string; isHidden: boolean; order: number }[];
}

export const problems: ProblemSeed[] = [
  {
    slug: 'two-sum',
    title: 'Two Sum',
    difficulty: 'EASY' as any,
    tags: ['Array', 'Hash Table'],
    xpReward: 50,
    order: 1,
    statement: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

**Input format (stdin):** First line is array length \`n\`, second line is \`n\` space-separated integers, third line is \`target\`.
**Output format:** Two space-separated indices.`,
    constraints: `- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.`,
    hints: [
      'A brute force approach checks every pair — can you do better than O(n²)?',
      'As you scan the array, think about what complement you still need for each number.',
      'Use a hash map to store each value and its index so you can find the complement in O(1).',
    ],
    starterCode: starterCodesBySlug['two-sum'],
    examples: [
      {
        input: '4\n2 7 11 15\n9',
        output: '0 1',
        explanation: 'Because nums[0] + nums[1] == 9, we return 0 1.',
        order: 0,
      },
      {
        input: '3\n3 2 4\n6',
        output: '1 2',
        explanation: 'nums[1] + nums[2] == 6, so we return 1 2.',
        order: 1,
      },
    ],
    testCases: [
      { input: '4\n2 7 11 15\n9', expected: '0 1', isHidden: false, order: 0 },
      { input: '3\n3 2 4\n6', expected: '1 2', isHidden: false, order: 1 },
      { input: '2\n3 3\n6', expected: '0 1', isHidden: true, order: 2 },
      { input: '5\n1 5 3 7 9\n10', expected: '1 3', isHidden: true, order: 3 },
      { input: '5\n-1 -2 -3 -4 -5\n-8', expected: '2 4', isHidden: true, order: 4 },
      { input: '4\n0 4 3 0\n0', expected: '0 3', isHidden: true, order: 5 },
      { input: '3\n1000000000 -1000000000 500000000\n0', expected: '0 1', isHidden: true, order: 6 },
      { input: '3\n5 75 25\n100', expected: '1 2', isHidden: true, order: 7 },
      { input: '2\n1 2\n3', expected: '0 1', isHidden: true, order: 8 },
      { input: '5\n10 20 30 40 50\n90', expected: '3 4', isHidden: true, order: 9 },
    ],
  },
  {
    slug: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'EASY' as any,
    tags: ['Stack', 'String'],
    xpReward: 50,
    order: 2,
    statement: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

**Input format:** A single string on stdin.
**Output format:** Print \`true\` or \`false\`.`,
    constraints: `- 1 <= s.length <= 10^4
- s consists of parentheses only '()[]{}'.`,
    hints: [
      'When you see an opening bracket, you need to remember it until a matching close appears.',
      'A stack is the natural structure for "most recent unmatched opener".',
      'Push openers; on a closer, pop and verify the pair matches. Empty stack at the end means valid.',
    ],
    starterCode: starterCodesBySlug['valid-parentheses'],
    examples: [
      { input: '()', output: 'true', explanation: 'A single pair of parentheses is properly nested.', order: 0 },
      { input: '([)]', output: 'false', explanation: 'The brackets are not closed in the correct order.', order: 1 },
    ],
    testCases: [
      { input: '()', expected: 'true', isHidden: false, order: 0 },
      { input: '()[]{}', expected: 'true', isHidden: false, order: 1 },
      { input: '(]', expected: 'false', isHidden: true, order: 2 },
      { input: '([)]', expected: 'false', isHidden: true, order: 3 },
      { input: '{[]}', expected: 'true', isHidden: true, order: 4 },
      { input: '((((()))))', expected: 'true', isHidden: true, order: 5 },
      { input: '((', expected: 'false', isHidden: true, order: 6 },
      { input: '))', expected: 'false', isHidden: true, order: 7 },
      { input: '[', expected: 'false', isHidden: true, order: 8 },
      { input: '{[()()]}', expected: 'true', isHidden: true, order: 9 },
    ],
  },
  {
    slug: 'reverse-linked-list',
    title: 'Reverse Linked List',
    difficulty: 'EASY' as any,
    tags: ['Linked List', 'Recursion'],
    xpReward: 50,
    order: 3,
    statement: `Given space-separated node values representing a singly linked list, reverse the list and print the values.

**Input format:** Space-separated integers on one line.
**Output format:** Reversed values, space-separated.`,
    constraints: `- The number of nodes in the list is in the range [0, 5000].
- -5000 <= Node.val <= 5000`,
    hints: [
      'You can solve this iteratively by rewiring pointers one node at a time.',
      'Keep track of the previous node as you walk forward.',
      'For stdin/stdout: read values, reverse the array, print.',
    ],
    starterCode: starterCodesBySlug['reverse-linked-list'],
    examples: [
      { input: '1 2 3 4 5', output: '5 4 3 2 1', explanation: 'The list is reversed.', order: 0 },
      { input: '1 2', output: '2 1', explanation: 'Two nodes swap order.', order: 1 },
    ],
    testCases: [
      { input: '1 2 3 4 5', expected: '5 4 3 2 1', isHidden: false, order: 0 },
      { input: '1 2', expected: '2 1', isHidden: false, order: 1 },
      { input: '', expected: '', isHidden: true, order: 2 },
      { input: '1', expected: '1', isHidden: true, order: 3 },
      { input: '1 2 3', expected: '3 2 1', isHidden: true, order: 4 },
      { input: '10 20 30', expected: '30 20 10', isHidden: true, order: 5 },
      { input: '-1 0 1', expected: '1 0 -1', isHidden: true, order: 6 },
      { input: '5 5 5', expected: '5 5 5', isHidden: true, order: 7 },
      { input: '100', expected: '100', isHidden: true, order: 8 },
      { input: '1 3 5 7 9 11', expected: '11 9 7 5 3 1', isHidden: true, order: 9 },
    ],
  },
  {
    slug: 'best-time-to-buy-and-sell-stock',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'EASY' as any,
    tags: ['Array', 'Greedy'],
    xpReward: 50,
    order: 4,
    statement: `You are given prices where \`prices[i]\` is the stock price on day \`i\`. Return the maximum profit from one buy and one sell.

**Input format:** Space-separated prices on one line.
**Output format:** A single integer (maximum profit).`,
    constraints: `- 1 <= prices.length <= 10^5
- 0 <= prices[i] <= 10^4`,
    hints: [
      'You must buy before you sell — only consider future days for selling.',
      'Track the minimum price seen so far as you scan the array.',
      'At each day, profit if sold today is price - minPrice. Keep the global maximum.',
    ],
    starterCode: starterCodesBySlug['best-time-to-buy-and-sell-stock'],
    examples: [
      { input: '7 1 5 3 6 4', output: '5', explanation: 'Buy at 1, sell at 6.', order: 0 },
      { input: '7 6 4 3 1', output: '0', explanation: 'Prices only decrease.', order: 1 },
    ],
    testCases: [
      { input: '7 1 5 3 6 4', expected: '5', isHidden: false, order: 0 },
      { input: '7 6 4 3 1', expected: '0', isHidden: false, order: 1 },
      { input: '1', expected: '0', isHidden: true, order: 2 },
      { input: '1 2', expected: '1', isHidden: true, order: 3 },
      { input: '2 1', expected: '0', isHidden: true, order: 4 },
      { input: '1 2 3 4 5', expected: '4', isHidden: true, order: 5 },
      { input: '3 3 5 0 0 3 1 4', expected: '4', isHidden: true, order: 6 },
      { input: '5 4 3 2 1 10', expected: '9', isHidden: true, order: 7 },
      { input: '1 5 1 5', expected: '4', isHidden: true, order: 8 },
      { input: '10000 1 10000', expected: '9999', isHidden: true, order: 9 },
    ],
  },
  {
    slug: 'climbing-stairs',
    title: 'Climbing Stairs',
    difficulty: 'EASY' as any,
    tags: ['Dynamic Programming'],
    xpReward: 50,
    order: 5,
    statement: `You are climbing a staircase with \`n\` steps. Each time you can climb 1 or 2 steps. How many distinct ways?

**Input format:** Single integer \`n\` on stdin.
**Output format:** Single integer.`,
    constraints: `- 1 <= n <= 45`,
    hints: [
      'Think about how many ways exist to reach step n from smaller steps.',
      'Ways to reach step n = ways(n-1) + ways(n-2).',
      'This is Fibonacci. Use bottom-up DP with two variables to save space.',
    ],
    starterCode: starterCodesBySlug['climbing-stairs'],
    examples: [
      { input: '2', output: '2', explanation: '1+1 or 2 — two distinct ways.', order: 0 },
      { input: '3', output: '3', explanation: '1+1+1, 1+2, or 2+1 — three ways.', order: 1 },
    ],
    testCases: [
      { input: '2', expected: '2', isHidden: false, order: 0 },
      { input: '3', expected: '3', isHidden: false, order: 1 },
      { input: '1', expected: '1', isHidden: true, order: 2 },
      { input: '4', expected: '5', isHidden: true, order: 3 },
      { input: '5', expected: '8', isHidden: true, order: 4 },
      { input: '10', expected: '89', isHidden: true, order: 5 },
      { input: '20', expected: '10946', isHidden: true, order: 6 },
      { input: '30', expected: '1346269', isHidden: true, order: 7 },
      { input: '45', expected: '1836311903', isHidden: true, order: 8 },
      { input: '6', expected: '13', isHidden: true, order: 9 },
    ],
  },
  {
    slug: 'merge-intervals',
    title: 'Merge Intervals',
    difficulty: 'MEDIUM' as any,
    tags: ['Array', 'Sorting'],
    xpReward: 100,
    order: 6,
    statement: `Given intervals, merge all overlapping intervals.

**Input format:** Each interval on its own line as \`start end\` (space-separated).
**Output format:** Each merged interval on its own line.`,
    constraints: `- 1 <= intervals.length <= 10^4
- intervals[i].length == 2
- 0 <= start_i <= end_i <= 10^4`,
    hints: [
      'If intervals overlap when sorted, merging becomes much easier.',
      'Sort intervals by start time first.',
      'Compare each interval with the last merged one; extend end if overlapping, else append.',
    ],
    starterCode: starterCodesBySlug['merge-intervals'],
    examples: [
      {
        input: '1 3\n2 6\n8 10\n15 18',
        output: '1 6\n8 10\n15 18',
        explanation: '[1,3] and [2,6] overlap, merge into [1,6].',
        order: 0,
      },
      { input: '1 4\n4 5', output: '1 5', explanation: 'Intervals [1,4] and [4,5] touch.', order: 1 },
    ],
    testCases: [
      { input: '1 3\n2 6\n8 10\n15 18', expected: '1 6\n8 10\n15 18', isHidden: false, order: 0 },
      { input: '1 4\n4 5', expected: '1 5', isHidden: false, order: 1 },
      { input: '1 4', expected: '1 4', isHidden: true, order: 2 },
      { input: '1 4\n0 4', expected: '0 4', isHidden: true, order: 3 },
      { input: '1 4\n2 3', expected: '1 4', isHidden: true, order: 4 },
      { input: '1 10\n2 3\n4 5\n6 7', expected: '1 10', isHidden: true, order: 5 },
      { input: '2 3\n4 5\n6 7\n8 9\n1 10', expected: '1 10', isHidden: true, order: 6 },
      { input: '0 0\n1 2\n3 4', expected: '0 0\n1 2\n3 4', isHidden: true, order: 7 },
      { input: '5 5\n1 2\n3 4', expected: '1 2\n3 4\n5 5', isHidden: true, order: 8 },
      { input: '1 3\n2 4\n5 7\n6 8', expected: '1 4\n5 8', isHidden: true, order: 9 },
    ],
  },
  {
    slug: 'longest-substring-without-repeating-characters',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'MEDIUM' as any,
    tags: ['Sliding Window', 'Hash Table'],
    xpReward: 100,
    order: 7,
    statement: `Given a string \`s\`, find the length of the longest substring without repeating characters.

**Input format:** A single string on stdin.
**Output format:** A single integer.`,
    constraints: `- 0 <= s.length <= 5 * 10^4
- s consists of English letters, digits, symbols and spaces.`,
    hints: [
      'A substring is contiguous — a sliding window can represent all valid substrings.',
      'Expand the window right; when a duplicate appears, shrink from the left.',
      'Use a hash set or map to track characters in the current window and their indices.',
    ],
    starterCode: starterCodesBySlug['longest-substring-without-repeating-characters'],
    examples: [
      { input: 'abcabcbb', output: '3', explanation: 'The answer is "abc", with length 3.', order: 0 },
      { input: 'bbbbb', output: '1', explanation: 'The answer is "b", with length 1.', order: 1 },
    ],
    testCases: [
      { input: 'abcabcbb', expected: '3', isHidden: false, order: 0 },
      { input: 'bbbbb', expected: '1', isHidden: false, order: 1 },
      { input: '', expected: '0', isHidden: true, order: 2 },
      { input: 'pwwkew', expected: '3', isHidden: true, order: 3 },
      { input: ' ', expected: '1', isHidden: true, order: 4 },
      { input: 'au', expected: '2', isHidden: true, order: 5 },
      { input: 'dvdf', expected: '3', isHidden: true, order: 6 },
      { input: 'abcdef', expected: '6', isHidden: true, order: 7 },
      { input: 'abba', expected: '2', isHidden: true, order: 8 },
      { input: 'tmmzuxt', expected: '5', isHidden: true, order: 9 },
    ],
  },
  {
    slug: 'binary-search',
    title: 'Binary Search',
    difficulty: 'EASY' as any,
    tags: ['Binary Search', 'Array'],
    xpReward: 50,
    order: 8,
    statement: `Given a sorted array and a target, return the index of target or -1.

**Input format:** First line is \`n\`, second line is \`n\` sorted integers, third line is \`target\`.
**Output format:** Single integer index.`,
    constraints: `- 1 <= nums.length <= 10^4
- All integers in nums are unique.
- nums is sorted in ascending order.`,
    hints: [
      'Linear scan works but violates the O(log n) requirement.',
      'Compare target with the middle element to eliminate half the search space.',
      'Maintain left and right pointers; loop while left <= right and adjust bounds.',
    ],
    starterCode: starterCodesBySlug['binary-search'],
    examples: [
      { input: '4\n-1 0 3 5\n3', output: '2', explanation: '3 exists at index 2.', order: 0 },
      { input: '6\n-1 0 3 5 9 12\n2', output: '-1', explanation: '2 does not exist.', order: 1 },
    ],
    testCases: [
      { input: '4\n-1 0 3 5\n3', expected: '2', isHidden: false, order: 0 },
      { input: '6\n-1 0 3 5 9 12\n2', expected: '-1', isHidden: false, order: 1 },
      { input: '1\n5\n5', expected: '0', isHidden: true, order: 2 },
      { input: '1\n5\n-5', expected: '-1', isHidden: true, order: 3 },
      { input: '5\n1 2 3 4 5\n1', expected: '0', isHidden: true, order: 4 },
      { input: '5\n1 2 3 4 5\n5', expected: '4', isHidden: true, order: 5 },
      { input: '5\n1 2 3 4 5\n3', expected: '2', isHidden: true, order: 6 },
      { input: '7\n1 3 5 7 9 11 13\n8', expected: '-1', isHidden: true, order: 7 },
      { input: '5\n-10 -5 0 5 10\n0', expected: '2', isHidden: true, order: 8 },
      { input: '2\n1 2\n2', expected: '1', isHidden: true, order: 9 },
    ],
  },
  {
    slug: 'number-of-islands',
    title: 'Number of Islands',
    difficulty: 'MEDIUM' as any,
    tags: ['Graph', 'BFS', 'DFS'],
    xpReward: 100,
    order: 9,
    statement: `Given a 2D grid of \`1\`s (land) and \`0\`s (water), return the number of islands.

**Input format:** Each row on a new line, cells space-separated.
**Output format:** Single integer.`,
    constraints: `- 1 <= m, n <= 300
- grid[i][j] is '0' or '1'.`,
    hints: [
      'Each unvisited land cell could be the start of a new island.',
      'When you find land, explore all connected land cells before counting another island.',
      'Use DFS or BFS to mark visited cells, incrementing the count for each new start.',
    ],
    starterCode: starterCodesBySlug['number-of-islands'],
    examples: [
      {
        input: '1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0',
        output: '1',
        explanation: 'All land cells form one connected island.',
        order: 0,
      },
      {
        input: '1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1',
        output: '3',
        explanation: 'Three separate islands exist in the grid.',
        order: 1,
      },
    ],
    testCases: [
      { input: '1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0', expected: '1', isHidden: false, order: 0 },
      { input: '1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1', expected: '3', isHidden: false, order: 1 },
      { input: '1', expected: '1', isHidden: true, order: 2 },
      { input: '0', expected: '0', isHidden: true, order: 3 },
      { input: '1 0\n0 1', expected: '2', isHidden: true, order: 4 },
      { input: '1 1 1\n1 1 1\n1 1 1', expected: '1', isHidden: true, order: 5 },
      { input: '0 0 0\n0 0 0\n0 0 0', expected: '0', isHidden: true, order: 6 },
      { input: '1 0 1 0 1\n0 1 0 1 0\n1 0 1 0 1\n0 1 0 1 0', expected: '10', isHidden: true, order: 7 },
      { input: '1 1 1 1 1\n0 0 0 0 0', expected: '1', isHidden: true, order: 8 },
      { input: '1 0 0 0 0\n0 1 0 0 0\n0 0 1 0 0\n0 0 0 1 0\n0 0 0 0 1', expected: '5', isHidden: true, order: 9 },
    ],
  },
  {
    slug: 'coin-change',
    title: 'Coin Change',
    difficulty: 'MEDIUM' as any,
    tags: ['Dynamic Programming'],
    xpReward: 100,
    order: 10,
    statement: `Return the fewest number of coins needed to make up \`amount\`, or -1 if impossible.

**Input format:** First line is coin count \`n\`, second line is \`n\` coin values, third line is \`amount\`.
**Output format:** Single integer.`,
    constraints: `- 1 <= coins.length <= 12
- 0 <= amount <= 10^4`,
    hints: [
      'Greedy does not always work for arbitrary coin denominations.',
      'For each amount, try using each coin and take the minimum over subproblems.',
      'Define dp[a] = min coins for amount a. Initialize dp[0]=0, others to infinity.',
    ],
    starterCode: starterCodesBySlug['coin-change'],
    examples: [
      { input: '3\n1 5 11\n11', output: '1', explanation: 'One 11-cent coin.', order: 0 },
      { input: '1\n2\n3', output: '-1', explanation: 'Cannot make 3 with only 2-cent coins.', order: 1 },
    ],
    testCases: [
      { input: '3\n1 5 11\n11', expected: '1', isHidden: false, order: 0 },
      { input: '1\n2\n3', expected: '-1', isHidden: false, order: 1 },
      { input: '3\n1 2 5\n11', expected: '3', isHidden: true, order: 2 },
      { input: '1\n1\n0', expected: '0', isHidden: true, order: 3 },
      { input: '1\n1\n1', expected: '1', isHidden: true, order: 4 },
      { input: '3\n1 2 5\n100', expected: '20', isHidden: true, order: 5 },
      { input: '4\n2 5 10 1\n27', expected: '4', isHidden: true, order: 6 },
      { input: '4\n186 419 83 408\n6249', expected: '20', isHidden: true, order: 7 },
      { input: '3\n1 3 4\n6', expected: '2', isHidden: true, order: 8 },
      { input: '3\n5 10 25\n30', expected: '2', isHidden: true, order: 9 },
    ],
  },
];
