require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize } = require("./config/db");
const User = require("./models/User");
const Problem = require("./models/Problem");
const BugProblem = require("./models/BugProblem");
const extraProblems = require("./data/problemsData");

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");
    await sequelize.sync({ force: true });
    console.log("✅ Tables created");

    // --- USERS ---
    const adminPass = await bcrypt.hash("admin123", 10);
    const mentorPass = await bcrypt.hash("mentor123", 10);
    const studentPass = await bcrypt.hash("student123", 10);

    await User.bulkCreate([
      { name: "Admin User", email: "admin@codesensei.com", password: adminPass, role: "admin", xp: 0, level: 1, streak: 1, solved: [], bugs_solved: [], badges: [], verified: true },
      { name: "Prof. Sharma", email: "mentor@codesensei.com", password: mentorPass, role: "mentor", xp: 800, level: 8, streak: 3, solved: [], bugs_solved: [], badges: ["🎓"], verified: true },
      { name: "Jaya Devi", email: "student@codesensei.com", password: studentPass, role: "student", xp: 620, level: 12, streak: 7, solved: [1, 2, 3], bugs_solved: [1], badges: ["🔥", "🐛", "⚡", "💡"], verified: true },
      { name: "Arjun S.", email: "arjun@example.com", password: studentPass, role: "student", xp: 3420, level: 25, streak: 14, solved: [1,2,3,4,5,6,7,8], bugs_solved: [1,2,3], badges: ["🔥","🐛","⚡","💡","🌟","👑"], verified: true },
      { name: "Priya K.", email: "priya@example.com", password: studentPass, role: "student", xp: 3110, level: 22, streak: 10, solved: [1,2,3,4,5,6], bugs_solved: [1,2], badges: ["🔥","🐛","⚡"], verified: true },
    ]);
    console.log("✅ Users seeded");

    // --- PROBLEMS ---
    await Problem.bulkCreate(extraProblems);
    console.log(`✅ Problems seeded (${extraProblems.length})`);

    // --- BUG PROBLEMS ---
    await BugProblem.bulkCreate([
      { title: "Fibonacci Bug", difficulty: "Easy", points: 20, description: "The recursive Fibonacci function has a bug on line 7. Fix it!", buggy_code: "def fibonacci(n):\n    if n <= 0:\n        return 0\n    elif n == 1:\n        return 1\n    else:\n        return fibonacci(n - 1) + fibonacci(n - 1)\n\n# Expected: fibonacci(6) → 8\nprint(fibonacci(6))", bug_lines: [7], hint: "Line 7: the second recursive call uses wrong argument. Fib(n) = Fib(n-1) + Fib(n-2), not Fib(n-1) + Fib(n-1).", fix_keyword: "n - 2", expected_output: "8" },
      { title: "Off-By-One Loop", difficulty: "Easy", points: 20, description: "This function should sum all elements but misses the last element.", buggy_code: "def sum_array(arr):\n    total = 0\n    for i in range(len(arr) - 1):\n        total += arr[i]\n    return total\n\n# Expected: sum_array([1,2,3,4,5]) → 15\nprint(sum_array([1, 2, 3, 4, 5]))", bug_lines: [3], hint: "range(len(arr)-1) should be range(len(arr)).", fix_keyword: "range(len(arr))", expected_output: "15" },
      { title: "String Palindrome Bug", difficulty: "Easy", points: 20, description: "The palindrome check always returns True. Find why and fix it.", buggy_code: "def is_palindrome(s):\n    s = s.lower()\n    return s == s\n\n# Expected: is_palindrome(\"hello\") → False\nprint(is_palindrome(\"hello\"))\nprint(is_palindrome(\"racecar\"))", bug_lines: [3], hint: "The comparison is comparing s with itself, not with its reverse s[::-1].", fix_keyword: "[::-1]", expected_output: "False\nTrue" },
      { title: "Binary Search Bug", difficulty: "Medium", points: 30, description: "The binary search returns wrong index. The mid calculation has a bug.", buggy_code: "def binary_search(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = left + right // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] <= target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n\nprint(binary_search([1,3,5,7,9], 5))", bug_lines: [4, 7], hint: "Line 4: use (left+right)//2. Line 7: should be < not <=.", fix_keyword: "(left + right) // 2", expected_output: "2" },
      { title: "Stack Empty Check Bug", difficulty: "Medium", points: 30, description: "The parenthesis validator has a logic error.", buggy_code: "def is_valid(s):\n    stack = []\n    pairs = {')':'(', '}':'{', ']':'['}\n    for c in s:\n        if c in '({[':\n            stack.append(c)\n        else:\n            if not stack:\n                return False\n            stack.pop()\n    return True\n\nprint(is_valid(\"([)]\"))", bug_lines: [10], hint: "stack.pop() should compare with pairs[c] before popping.", fix_keyword: "stack[-1]", expected_output: "False" },
      { title: "Factorial Recursion Bug", difficulty: "Hard", points: 35, description: "The recursive factorial is missing its base case causing infinite recursion.", buggy_code: "def factorial(n):\n    return n * factorial(n - 1)\n\n# Expected: factorial(5) → 120\nprint(factorial(5))", bug_lines: [1, 2], hint: "Add: if n == 0 or n == 1: return 1 as the base case.", fix_keyword: "return 1", expected_output: "120" },
      { title: "List Append Bug", difficulty: "Easy", points: 20, description: "The function should return a list with all numbers doubled, but it returns None.", buggy_code: "def double_numbers(nums):\n    result = []\n    for num in nums:\n        result = result.append(num * 2)\n    return result\n\n# Expected: double_numbers([1, 2, 3]) → [2, 4, 6]\nprint(double_numbers([1, 2, 3]))", bug_lines: [4], hint: "append() modifies the list in place and returns None. Don't reassign `result` to the return value of `append()`.", fix_keyword: "result.append", expected_output: "[2, 4, 6]" },
      { title: "Dictionary Key Error", difficulty: "Medium", points: 30, description: "The function counts frequencies of characters but throws a KeyError for new characters.", buggy_code: "def count_chars(s):\n    freq = {}\n    for char in s:\n        freq[char] = freq[char] + 1\n    return freq\n\n# Expected: count_chars('hello') → {'h': 1, 'e': 1, 'l': 2, 'o': 1}\nprint(count_chars('hello'))", bug_lines: [4], hint: "You can't add 1 to a key that doesn't exist yet. Use `.get(char, 0)`.", fix_keyword: "get(char, 0)", expected_output: "{'h': 1, 'e': 1, 'l': 2, 'o': 1}" },
      { title: "Infinite While Loop", difficulty: "Medium", points: 30, description: "This function is supposed to remove all instances of 'val' from the list, but it fails to work properly.", buggy_code: "def remove_val(nums, val):\n    i = 0\n    while i < len(nums):\n        if nums[i] == val:\n            nums.pop(i)\n        i += 1\n    return nums\n\n# Expected: remove_val([3, 2, 2, 3], 3) → [2, 2]\nprint(remove_val([3, 2, 2, 3], 3))", bug_lines: [5, 6], hint: "When you pop an element, the list shrinks, so the next element shifts left. If you increment `i` in the same iteration, you skip the next element.", fix_keyword: "else", expected_output: "[2, 2]" }
    ]);
    console.log("✅ Bug problems seeded (9)");

    console.log("\n🎉 Seed complete!");
  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    // Only exit the process if this file was run directly from the command line
    if (require.main === module) {
      process.exit();
    }
  }
}

// Automatically run if called directly (e.g., `node seed.js`)
if (require.main === module) {
  seed();
}

// Export for use in API routes
module.exports = seed;
