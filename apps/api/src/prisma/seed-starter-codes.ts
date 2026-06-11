const JS_READ = `const input = require('fs').readFileSync(0, 'utf8').trim()`;

export const starterCodesBySlug: Record<string, Record<string, string>> = {
  'two-sum': {
    python: `import sys

def solve():
    data = sys.stdin.read().split()
    n = int(data[0])
    nums = list(map(int, data[1:n+1]))
    target = int(data[n+1])

    seen = {}
    for i, num in enumerate(nums):
        if target - num in seen:
            print(seen[target - num], i)
            return
        seen[num] = i

solve()`,
    javascript: `${JS_READ};
const data = input.split(/\\s+/).map(Number);
const n = data[0];
const nums = data.slice(1, n + 1);
const target = data[n + 1];

const seen = {};
for (let i = 0; i < nums.length; i++) {
  const complement = target - nums[i];
  if (seen[complement] !== undefined) {
    console.log(seen[complement], i);
    process.exit(0);
  }
  seen[nums[i]] = i;
}`,
  },

  'valid-parentheses': {
    python: `import sys

def solve():
    s = sys.stdin.read().strip()

    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            if not stack or stack[-1] != mapping[char]:
                print("false")
                return
            stack.pop()
        else:
            stack.append(char)
    print("true" if not stack else "false")

solve()`,
    javascript: `${JS_READ};
const s = input;
const stack = [];
const mapping = { ')': '(', '}': '{', ']': '[' };
for (const char of s) {
  if (char in mapping) {
    if (!stack.length || stack[stack.length - 1] !== mapping[char]) {
      console.log('false');
      process.exit(0);
    }
    stack.pop();
  } else {
    stack.push(char);
  }
}
console.log(stack.length === 0 ? 'true' : 'false');`,
  },

  'reverse-linked-list': {
    python: `import sys

def solve():
    data = list(map(int, sys.stdin.read().split()))
    result = data[::-1]
    print(*result)

solve()`,
    javascript: `${JS_READ};
const data = input ? input.split(/\\s+/).map(Number) : [];
const result = data.slice().reverse();
console.log(result.join(' '));`,
  },

  'best-time-to-buy-and-sell-stock': {
    python: `import sys

def solve():
    data = sys.stdin.read().split()
    prices = list(map(int, data))

    min_price = float('inf')
    max_profit = 0
    for price in prices:
        min_price = min(min_price, price)
        max_profit = max(max_profit, price - min_price)
    print(max_profit)

solve()`,
    javascript: `${JS_READ};
const prices = input.split(/\\s+/).map(Number);
let minPrice = Infinity;
let maxProfit = 0;
for (const price of prices) {
  minPrice = Math.min(minPrice, price);
  maxProfit = Math.max(maxProfit, price - minPrice);
}
console.log(maxProfit);`,
  },

  'climbing-stairs': {
    python: `import sys

def solve():
    n = int(sys.stdin.read().strip())

    if n <= 2:
        print(n)
        return
    a, b = 1, 2
    for _ in range(3, n+1):
        a, b = b, a + b
    print(b)

solve()`,
    javascript: `${JS_READ};
const n = parseInt(input, 10);
if (n <= 2) {
  console.log(n);
} else {
  let a = 1, b = 2;
  for (let i = 3; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  console.log(b);
}`,
  },

  'merge-intervals': {
    python: `import sys

def solve():
    data = sys.stdin.read().strip().split('\\n')
    intervals = []
    for line in data:
        if not line.strip():
            continue
        a, b = map(int, line.split())
        intervals.append([a, b])

    intervals.sort()
    merged = [intervals[0]]
    for start, end in intervals[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])

    for interval in merged:
        print(interval[0], interval[1])

solve()`,
    javascript: `${JS_READ};
const lines = input.split('\\n').filter((l) => l.trim());
const intervals = lines.map((line) => line.trim().split(/\\s+/).map(Number));
intervals.sort((a, b) => a[0] - b[0]);
const merged = [intervals[0]];
for (let i = 1; i < intervals.length; i++) {
  const [start, end] = intervals[i];
  const last = merged[merged.length - 1];
  if (start <= last[1]) {
    last[1] = Math.max(last[1], end);
  } else {
    merged.push([start, end]);
  }
}
for (const [a, b] of merged) console.log(a, b);`,
  },

  'longest-substring-without-repeating-characters': {
    python: `import sys

def solve():
    s = sys.stdin.read().strip()

    seen = {}
    start = 0
    max_len = 0
    for i, char in enumerate(s):
        if char in seen and seen[char] >= start:
            start = seen[char] + 1
        seen[char] = i
        max_len = max(max_len, i - start + 1)
    print(max_len)

solve()`,
    javascript: `${JS_READ};
const s = input;
const seen = {};
let start = 0;
let maxLen = 0;
for (let i = 0; i < s.length; i++) {
  const char = s[i];
  if (char in seen && seen[char] >= start) start = seen[char] + 1;
  seen[char] = i;
  maxLen = Math.max(maxLen, i - start + 1);
}
console.log(maxLen);`,
  },

  'binary-search': {
    python: `import sys

def solve():
    data = sys.stdin.read().split()
    n = int(data[0])
    nums = list(map(int, data[1:n+1]))
    target = int(data[n+1])

    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            print(mid)
            return
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    print(-1)

solve()`,
    javascript: `${JS_READ};
const data = input.split(/\\s+/).map(Number);
const n = data[0];
const nums = data.slice(1, n + 1);
const target = data[n + 1];
let left = 0, right = nums.length - 1;
while (left <= right) {
  const mid = Math.floor((left + right) / 2);
  if (nums[mid] === target) { console.log(mid); process.exit(0); }
  if (nums[mid] < target) left = mid + 1;
  else right = mid - 1;
}
console.log(-1);`,
  },

  'number-of-islands': {
    python: `import sys

def solve():
    data = sys.stdin.read().strip().split('\\n')
    grid = [list(line.split()) for line in data if line.strip()]

    def dfs(i, j):
        if i < 0 or i >= len(grid) or j < 0 or j >= len(grid[0]):
            return
        if grid[i][j] != '1':
            return
        grid[i][j] = '0'
        dfs(i+1,j); dfs(i-1,j); dfs(i,j+1); dfs(i,j-1)

    count = 0
    for i in range(len(grid)):
        for j in range(len(grid[0])):
            if grid[i][j] == '1':
                dfs(i, j)
                count += 1
    print(count)

solve()`,
    javascript: `${JS_READ};
const lines = input.split('\\n').filter((l) => l.trim());
const grid = lines.map((line) => line.trim().split(/\\s+/));
function dfs(i, j) {
  if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length) return;
  if (grid[i][j] !== '1') return;
  grid[i][j] = '0';
  dfs(i+1,j); dfs(i-1,j); dfs(i,j+1); dfs(i,j-1);
}
let count = 0;
for (let i = 0; i < grid.length; i++) {
  for (let j = 0; j < grid[0].length; j++) {
    if (grid[i][j] === '1') { dfs(i, j); count++; }
  }
}
console.log(count);`,
  },

  'coin-change': {
    python: `import sys

def solve():
    data = sys.stdin.read().split()
    n = int(data[0])
    coins = list(map(int, data[1:n+1]))
    amount = int(data[n+1])

    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        for x in range(coin, amount + 1):
            dp[x] = min(dp[x], dp[x-coin] + 1)

    print(-1 if dp[amount] == float('inf') else dp[amount])

solve()`,
    javascript: `${JS_READ};
const data = input.split(/\\s+/).map(Number);
const n = data[0];
const coins = data.slice(1, n + 1);
const amount = data[n + 1];
const dp = Array(amount + 1).fill(Infinity);
dp[0] = 0;
for (const coin of coins) {
  for (let x = coin; x <= amount; x++) {
    dp[x] = Math.min(dp[x], dp[x - coin] + 1);
  }
}
console.log(dp[amount] === Infinity ? -1 : dp[amount]);`,
  },
};
