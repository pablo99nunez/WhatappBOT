function getNumber(number) {
  let finalnumber = number
  if (number.startsWith('549')) {
    finalnumber = number.substring(0, 2) + number.substring(3)
  }
  return finalnumber
}

console.log(getNumber('5492612512665'))

module.exports = {
  getNumber
}