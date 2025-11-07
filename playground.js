const generateUniqueCode = () => {
  const code = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
  return code;
};

console.log(generateUniqueCode());
