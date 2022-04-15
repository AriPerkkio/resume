export function getArgument(command) {
  const args = process.argv.slice(2);
  const indexOfCommand = args.indexOf(command);
  const indexOfValue = 1 + indexOfCommand;

  if (indexOfCommand === -1) {
    throw new Error(
      `Command ${command} is required. Usage: ${command} <value>`
    );
  }

  if (args.length <= indexOfValue) {
    throw new Error(
      `Command ${command} required value. Usage: ${command} <value>`
    );
  }

  return args[indexOfValue];
}
