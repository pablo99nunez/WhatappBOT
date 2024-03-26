function getNumber(number) {
  let finalnumber = number
  if (number.startsWith('549')) {
    finalnumber = number.substring(0, 2) + number.substring(3)
  }
  return finalnumber
}

module.exports = {
  getNumber
}