module.exports = {
    preset: 'ts-jest',
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
};