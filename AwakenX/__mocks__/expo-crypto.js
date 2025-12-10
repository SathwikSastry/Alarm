// Mock for expo-crypto
module.exports = {
  getRandomBytesAsync: async (byteCount) => {
    const bytes = new Uint8Array(byteCount);
    for (let i = 0; i < byteCount; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
  },
};
