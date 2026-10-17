// Фінальна перевірка заняття 71: дрібні методичні та UI-виправлення,
// які не змінюють основну логіку моделі.
(() => {
  const style = document.createElement('style');
  style.id = 'lesson71FinalAuditStyles';
  style.textContent = `
    /* Пояснення про довільну основу вже створюється як окрема картка JS.
       Прибираємо дубль, який раніше додавався через ::before. */
    body:has(#modeChip.free) #panelModel .space-y-3.text-xs.border-t.pt-3::before{
      content:none!important;
      display:none!important;
    }
  `;
  document.head.appendChild(style);

  document.addEventListener('DOMContentLoaded', () => {
    // Узгоджуємо акцентні кольори з teal-палітрою заняття.
    const countCard = document.getElementById('elementCountCard');
    if (countCard) {
      countCard.classList.remove('bg-indigo-50', 'border-indigo-200');
      countCard.classList.add('bg-teal-50', 'border-teal-200');
    }

    // Кожне завдання тренажера має бути самодостатнім, без залежності від попереднього.
    if (typeof tasks !== 'undefined' && tasks[2]) {
      tasks[2][0] = 'Правильна чотирикутна піраміда: a = 6 см, h = 4 см. Знайдіть площу повної поверхні.';
    }

    // Кнопка «Поза основою» повинна гарантовано переносити H за межі навіть
    // довільної основи. Найдальша вершина шаблону має радіус до 1,15R,
    // тому беремо 1,20–1,24R (у межах дозволеного 1,25R).
    const outside = document.getElementById('vertexOutside');
    if (outside?.parentNode) {
      const clean = outside.cloneNode(true);
      outside.parentNode.replaceChild(clean, outside);
      clean.addEventListener('click', () => {
        const angle = Math.random() * Math.PI * 2;
        const radius = 1.20 + Math.random() * 0.04;
        arbitraryHXFactor = Math.cos(angle) * radius;
        arbitraryHZFactor = Math.sin(angle) * radius;
        if (window.syncVertexPositionControls71) window.syncVertexPositionControls71();
        build();
      });
    }

    // Додаємо до інструкції режим зображення на площині.
    const list = document.querySelector('#drawer ol');
    if (list && !document.getElementById('helpPlane71')) {
      const li = document.createElement('li');
      li.id = 'helpPlane71';
      li.innerHTML = 'Перемикай <b>«3D-модель»</b> і <b>«Зображення на площині»</b>, щоб порівняти просторову модель зі стереометричним кресленням у зошиті.';
      list.insertBefore(li, list.children[1] || null);
    }
  });
})();