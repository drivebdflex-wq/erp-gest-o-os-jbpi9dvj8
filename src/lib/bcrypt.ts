/**
 * Mock implementation of bcrypt for the frontend mock backend environment.
 * Simulates hashing and comparing passwords with a specific salt round format.
 */
export const bcrypt = {
  hash: async (password: string, saltRounds: number): Promise<string> => {
    // Simulating bcrypt hash format: $2b$10$...
    return `$2b$${saltRounds}$` + btoa(password)
  },

  compare: async (password: string, hash: string): Promise<boolean> => {
    const parts = hash.split('$')
    if (parts.length === 4) {
      const saltRounds = parts[2]
      return hash === `$2b$${saltRounds}$` + btoa(password)
    }
    // Fallback for plain text mock passwords that were initialized in the mock DB
    return password === hash
  },
}
