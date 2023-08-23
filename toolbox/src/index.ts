async function main() {
  console.log("🚩 main()");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
