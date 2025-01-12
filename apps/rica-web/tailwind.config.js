const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

const controlCustomRules = {
    "border-color": "transparent",
    "border-width": "2.5px"
};

const controlFocusCustomRules = {
    "outline-style": "none",
    "border-color": "var(--fallback-bc, oklch(var(--bc) / 0.2))",
    "border-width": "2.5px"
};

const controlErrorCustomRules = {
    "border-color": "#DE0919",
    "border-width": "2.5px"
};

const selectArrowCustomRules = {
    "appearance": "none",
    "background-image": "url(\"/select-down-arrow.svg\")",
    "background-repeat": "no-repeat",
    "background-position": "right 0.7rem top 50%",
    "background-size": "1rem auto"
}

const controlLabelCustomRules = {
    "padding": "0",
};

const controlLabelTextCustomRules = {
    "text-transform": "uppercase",
    "font-weight": "800",
    "font-size": "18px",
    "line-height": "1",
    "padding-bottom": "8px"
};

const controlLabelTextErrorCustomRules = {
    "color": "#DE0919"
};

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
        ...createGlobPatternsForDependencies(__dirname),
    ],
    theme: {
        extend: {},
    },
    plugins: [
        require('daisyui')
    ],
    daisyui: {
        themes: [
            {
                pastel: {
                    ...require("daisyui/src/theming/themes")["pastel"],
                    "primary": "#02509B",
                    "secondary": "#FDEA14",
                    "accent": "#DE0919",
                    "error": "#DE0919",
                    "--fallback-bc": "#02509B",
                    "input, select, button": {
                        ...controlCustomRules
                    },
                    "input:focus, select:focus, button:focus": {
                        ...controlFocusCustomRules
                    },
                    "input:focus-within, select:focus-within, button:focus-within": {
                        ...controlFocusCustomRules
                    },
                    ".error input, .error select, error button": {
                        ...controlErrorCustomRules
                    },
                    "select": {
                        ...selectArrowCustomRules
                    },
                    "label:has(input)>.label, label:has(select)>.label, label:has(button)>.label": {
                        ...controlLabelCustomRules
                    },
                    "label:has(input)>.label>.label-text, label:has(select)>.label>.label-text, label:has(button)>.label>.label-text": {
                        ...controlLabelTextCustomRules
                    },
                    "label.error:has(input)>.label>.label-text-alt, label.error:has(select)>.label>.label-text-alt, label.error:has(button)>.label>.label-text-alt": {
                        ...controlLabelTextErrorCustomRules
                    }
                }
            }
        ],
    }
};
