export interface Jeton {
  valeur: string
  position: number
}

export function tokeniser(expression: string): Jeton[] {
  const jetons: Jeton[] = []
  for (let index = 0; index < expression.length; index += 1) {
    const valeur = expression[index]
    if (valeur !== undefined && !/\s/u.test(valeur)) jetons.push({ valeur, position: index + 1 })
  }
  return jetons
}