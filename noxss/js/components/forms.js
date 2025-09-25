/* ==========================================================================
   Noxss Library: Forms Component (JavaScript)
   - Lógica para aprimorar elementos de formulário, como o input range.
   - Versão: 1.0
   ========================================================================== */

(function (Noxss, window, document) {
    'use strict';
    if (!Noxss) { console.error("Noxss Core é necessário."); return; }

    const FormsAPI = {
        init: function() {
            this.initRangeSliders();
        },

        initRangeSliders: function(container = document) {
            const sliders = container.querySelectorAll('.noxss-range');
            sliders.forEach(slider => {
                if (slider.dataset.rangeInitialized) return;

                // Cria o wrapper e o tooltip dinamicamente
                const wrapper = document.createElement('div');
                wrapper.className = 'noxss-range-wrapper';
                slider.parentNode.insertBefore(wrapper, slider);
                wrapper.appendChild(slider);

                const tooltip = document.createElement('span');
                tooltip.className = 'noxss-range-tooltip';
                wrapper.appendChild(tooltip);

                // Função para atualizar o preenchimento e o tooltip
                const updateSlider = () => {
                    const min = parseFloat(slider.min) || 0;
                    const max = parseFloat(slider.max) || 100;
                    const value = parseFloat(slider.value);
                    
                    // Calcula a porcentagem
                    const percent = ((value - min) / (max - min)) * 100;
                    
                    // Atualiza a variável CSS para o gradiente
                    slider.style.setProperty('--value-percent', `${percent}%`);

                    // Atualiza o tooltip
                    tooltip.textContent = value;
                    // Posiciona o tooltip acima do polegar
                    tooltip.style.left = `calc(${percent}% + (${10 - percent * 0.2}px))`;
                };

                // Listeners de evento
                slider.addEventListener('input', updateSlider);
                slider.addEventListener('mousedown', () => wrapper.classList.add('is-active'));
                slider.addEventListener('touchstart', () => wrapper.classList.add('is-active'));
                slider.addEventListener('mouseup', () => wrapper.classList.remove('is-active'));
                slider.addEventListener('touchend', () => wrapper.classList.remove('is-active'));
                
                // Atualização inicial
                updateSlider();
                slider.dataset.rangeInitialized = true;
            });
        }
    };

    Noxss.Forms = FormsAPI;
    document.addEventListener('DOMContentLoaded', () => Noxss.Forms.init());

})(window.Noxss, window, document);