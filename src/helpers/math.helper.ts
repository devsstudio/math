import { Big } from 'big.js';

export class MathHelper {

  //Es importante el order de los operadores, primero deben estar los compuestos porque se hace split en ese orden.
  private static OPERATORS = [
    '<>',
    '>=',
    '<=',
    '(',
    ')',
    '||',
    '&&',
    '>',
    '<',
    '=',
    '+',
    '-',
    '*',
    '/',
    '^'
  ];

  static and(x: Big.BigSource, y: Big.BigSource): number {
    var a = new Big(x);
    var b = new Big(y);
    var c = a.mul(b);
    return (c.gt(0)) ? 1 : 0;
  }

  static or(x: Big.BigSource, y: Big.BigSource): number {
    var a = new Big(x);
    var b = new Big(y);
    var c = a.plus(b);
    return (c.gt(0)) ? 1 : 0;
  }

  static eq(x: Big.BigSource, y: Big.BigSource): number {
    var a = new Big(x);
    var b = new Big(y);
    return (a.eq(b)) ? 1 : 0;
  }

  static gt(x: Big.BigSource, y: Big.BigSource): number {
    var a = new Big(x);
    var b = new Big(y);
    return (a.gt(b)) ? 1 : 0;
  }

  static lt(x: Big.BigSource, y: Big.BigSource): number {
    var a = new Big(x);
    var b = new Big(y);
    return (a.lt(b)) ? 1 : 0;
  }

  static gte(x: Big.BigSource, y: Big.BigSource): number {
    var a = new Big(x);
    var b = new Big(y);
    return (a.gte(b)) ? 1 : 0;
  }

  static lte(x: Big.BigSource, y: Big.BigSource): number {
    var a = new Big(x);
    var b = new Big(y);
    return (a.lte(b)) ? 1 : 0;
  }

  static neq(x: Big.BigSource, y: Big.BigSource): number {
    var a = new Big(x);
    var b = new Big(y);
    return (!a.eq(b)) ? 1 : 0;
  }

  static plus(x: Big.BigSource, y: Big.BigSource, fixed: number | undefined = undefined): number {
    var a = new Big(x);
    var b = new Big(y);
    var c = a.plus(b);
    return c.round(fixed).toNumber();
  }

  static minus(x: Big.BigSource, y: Big.BigSource, fixed: number | undefined = undefined): number {
    var a = new Big(x);
    var b = new Big(y);
    var c = a.minus(b);
    return c.round(fixed).toNumber();
  }

  static mul(x: Big.BigSource, y: Big.BigSource, fixed: number | undefined = undefined): number {
    var a = new Big(x);
    var b = new Big(y);
    var c = a.mul(b);
    return c.round(fixed).toNumber();
  }

  static div(x: Big.BigSource, y: Big.BigSource, fixed: number | undefined = undefined): number {
    var a = new Big(x);
    var b = new Big(y);
    var c = a.div(b);
    return c.round(fixed).toNumber();
  }

  static mod(x: Big.BigSource, y: Big.BigSource, fixed: number | undefined = undefined): number {
    var a = new Big(x);
    var b = new Big(y);
    var c = a.mod(b);
    return c.round(fixed).toNumber();
  }

  static pow(x: Big.BigSource, y: Big.BigSource, fixed: number | undefined = undefined): number {
    var a = new Big(x);
    var b = new Big(y);
    var c = a.pow(b.toNumber());
    return c.round(fixed).toNumber();
  }

  static floor(x: Big.BigSource, fixed: number = 0): number {
    var a = new Big(x)
    var factor = MathHelper.pow(10, fixed);
    return MathHelper.round(Math.floor(a.mul(factor).toNumber()) / factor, fixed);
  }

  static round(x: Big.BigSource, fixed: number, mode: Big.RoundingMode = Big.roundHalfUp) {
    var a = new Big(x)
    return a.round(fixed, mode).toNumber();
  }

  static convertToPostFix(infix: string[], variables: { [key: string]: string } | false = false) {

    var operatorsStack: any[] = [];

    var postfix = '';

    for (var i = 0; i < infix.length; i++) {

      if (infix[i].trim() != '') {
        if (MathHelper._isNumeric(infix[i])) {
          postfix += ' ' + infix[i];
        } else if (MathHelper._isVariable(infix[i])) {

          //Si es una variable lo reemplaza siempre y cuando haya variables para reemplazar
          if (variables !== false && variables[infix[i]] != null) {
            postfix += ' ' + variables[infix[i]];
          } else//Si no pasa como un operando
          {
            if (variables === false) {
              postfix += ' ' + Math.floor((Math.random() * 10) + 1);
            } else {
              throw 'variable not found: ' + infix[i]
              // postfix += ' ' + infix[i];
            }
          }

        } else {
          switch (infix[i]) {
            case '(':
              operatorsStack.push(infix[i]);
              break;
            case ')':
              var j = 0;
              while (MathHelper._top(operatorsStack) != '(') {//Extrae los operadores hasta que se encuentre un paréntesis izquierdo                                                        
                if (MathHelper._top(operatorsStack) !== null) {
                  postfix += ' ' + operatorsStack.pop();
                  j++;
                } else {
                  throw 'invalid expression';
                }
              }

              if (j === 0) {
                throw 'invalid expression';
              }
              operatorsStack.pop();
              break;
            default:

              if (operatorsStack.length === 0) {//Verifica si la pila de operadores está vacía                                  
                operatorsStack.push(infix[i]);//De ser así solo colocamos el operador en la pila                            
              } else {
                if (MathHelper._priority(infix[i]) <= MathHelper._priority(MathHelper._top(operatorsStack)))//Compara la prioridad del operador entrante con el que está en la cabecera de la pila
                {
                  while (MathHelper._priority(infix[i]) <= MathHelper._priority(MathHelper._top(operatorsStack)) && MathHelper._top(operatorsStack) != null) {//Extrae los operadores hasta que se encuentre con uno de peso mayor o se vacie la pila                                                        
                    var operador = operatorsStack.pop();//Si es menor debemos sacar el que está en la cabecera                                        
                    postfix += ' ' + operador;//y el que salio lo colocamos en postfix
                  }
                  operatorsStack.push(infix[i]);//Y colocar el entrante en la cabecera
                } else
                  operatorsStack.push(infix[i]);//Si el operador entrante fuese de mayor prioridad que el de la cabecera, simplemente se coloca en la pila
              }
              break;
          }
        }
      }

    }

    while (operatorsStack.length > 0)
      postfix += ' ' + operatorsStack.pop();
    return postfix;
  }

  static calcExpression(infix: string, variables: { [key: string]: string } | false = false, fixed: number = 2) {
    try {
      //alert(infix);
      var wildcard = ',';

      infix = infix.replace(/ /g, wildcard);

      var a1 = [infix]; //console.log(a1);
      var aux = [];
      var a2 = [];
      var op = MathHelper.OPERATORS;
      op.push(wildcard);

      for (var x = 0; x < op.length; x++) {
        for (var y = 0; y < a1.length; y++) {
          //Si ya s un operador mandamos al array
          if (MathHelper._isOperator(a1[y])) {
            a2.push(a1[y]);
          } else {
            aux = a1[y].split(op[x]);
            for (var z = 0; z < aux.length; z++) {
              if (aux[z] != '') {
                a2.push(aux[z]);
              }
              if (z < aux.length - 1) {
                if (op[x] !== wildcard) {
                  a2.push(op[x]);
                }
              }
            }
          }
        }
        a1 = a2;
        a2 = [];
      }
      // console.log('a1', a1);
      var postfix = MathHelper.convertToPostFix(a1, variables);
      // console.log('postfix', postfix);
      var a_postfix = postfix.trim().split(' ');
      var operandsStack: any[] = [];

      for (var j = 0; j < a_postfix.length; j++) {
        if (MathHelper._isNumeric(a_postfix[j])) {
          operandsStack.push(parseFloat(a_postfix[j]));
        } else if (!MathHelper._isOperator(a_postfix[j])) {
          operandsStack.push(a_postfix[j]);
        } else {
          var num2 = operandsStack.pop();
          var num1 = operandsStack.pop();

          if (num2 === null || num1 === null) {
            if (variables === false) {
              throw 'invalid expression';
            } else {
              throw 'invalid expression';
            }
          }
          switch (a_postfix[j]) {
            case '||':
              operandsStack.push(MathHelper.or(num1, num2));
              break;
            case '&&':
              operandsStack.push(MathHelper.and(num1, num2));
              break;
            case '>':
              operandsStack.push(MathHelper.gt(num1, num2));
              break;
            case '<':
              operandsStack.push(MathHelper.lt(num1, num2));
              break;
            case '>=':
              operandsStack.push(MathHelper.gte(num1, num2));
              break;
            case '<=':
              operandsStack.push(MathHelper.lte(num1, num2));
              break;
            case '=':
              operandsStack.push(MathHelper.eq(num1, num2));
              break;
            case '<>':
              operandsStack.push(MathHelper.neq(num1, num2));
              break;
            case '+':
              operandsStack.push(MathHelper.plus(num1, num2));
              break;
            case '-':
              operandsStack.push(MathHelper.minus(num1, num2));
              break;
            case '*':
              operandsStack.push(MathHelper.mul(num1, num2));
              break;
            case '/':
              operandsStack.push(MathHelper.div(num1, num2));
              break;
            case '^':
              operandsStack.push(MathHelper.pow(num1, num2));
              break;
          }
        }
      }

      var result = new Big(operandsStack.pop()).toFixed(fixed);

      //La pila debe quedar vacia
      if (MathHelper._top(operandsStack) !== null) {
        throw 'invalid expression';
      }
      return result;
    } catch (ex) {
      throw ex;
    }
  }

  private static _isVariable(value: string) {
    return MathHelper.OPERATORS.indexOf(value) === -1;
  }

  private static _isOperator(value: string) {
    return MathHelper.OPERATORS.indexOf(value) !== -1;
  }

  private static _isNumeric(n: any) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  private static _priority(operator: string) {
    switch (operator) {
      case '(':
        return 0;
      case ')':
        return 0;
      //
      case '||':
        return 1;
      case '&&':
        return 2;
      case '>':
        return 3;
      case '<':
        return 3;
      case '>=':
        return 3;
      case '<=':
        return 3;
      case '=':
        return 3;
      case '<>':
        return 3;
      //
      case '+':
        return 4;
      case '-':
        return 4;
      case '*':
        return 5;
      case '/':
        return 5;
      case '^':
        return 6;
      default:
        return 0;
    }
  }

  private static _top(stack: any[]) {
    if (stack.length > 0) {
      return stack[stack.length - 1]
    } else {
      return null;
    }
  }
}