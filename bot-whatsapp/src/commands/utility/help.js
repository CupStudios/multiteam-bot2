const helpText = `╭━━━━━━━━━━━━━━━━━━━╮
✧   *PANEL DE COMANDOS* ✧
╰━━━━━━━━━━━━━━━━━━━╯
¡Hola! Aquí tienes la lista de todo lo que puedo hacer por ti en el grupo. 🤖

┌── 🎭 *ROL Y PERFILES*
│
├ ➭ *!ficha*
│ Inicia el registro interactivo de tu personaje.
│
├ ➭ *!cancelar*
│ Cancela el registro interactivo actual.
│
├ ➭ *!verbio @usuario*
│ Muestra la ficha oficial y foto de la persona mencionada.
│
└──

┌── 💴 *SISTEMA DE ECONOMÍA*
│
├ ➭ *!bal* o *!bal @usuario*
│ Revisa tu saldo de Yenes o el de otra persona.
│
├ ➭ *!work*
│ Trabaja para ganar Yenes (⏱️ 10 min).
│
├ ➭ *!daily*
│ Tu recompensa diaria y racha (⏱️ 24h).
│
├ ➭ *!rob @usuario*
│ Intenta robarle a alguien. ¡Cuidado con la policía! (⏱️ 30 min).
│
├ ➭ *!dep [cantidad]* o *!dep all*
│ Guarda tus Yenes en el banco para evitar que te roben.
│
├ ➭ *!with [cantidad]* o *!with all*
│ Retira dinero del banco a tu billetera.
│
└──

> 💡 *Tip:* El dinero que guardes en el banco no puede ser robado. ¡Protege tus ganancias!`;

module.exports = {
  name: 'help',
  async execute({ message }) {
    await message.reply(helpText);
  }
};
