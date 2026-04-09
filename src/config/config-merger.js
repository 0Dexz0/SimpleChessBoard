/* 
 * @license MPL 2.0
 * Copyright (c) 2026 0Dexz0
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. You can read the full license at:
 * http://mozilla.org/MPL/2.0/.
 * Project: https://github.com/0Dex0/SimpleChessBoard
 */

import { DEFAULT_STYLE } from "./default-style"
import { DEFAULT_INTERACTIVITY } from "./default-interactivity"

function merge(defaultObj = {}, customObj = {}) {
    const defaultClone = structuredClone(defaultObj)
    const result = { ...defaultClone }

    for (const key in customObj) {
        const customVal = customObj[key]
        const defaultVal = defaultClone[key]

        if (
            defaultVal &&
            typeof defaultVal === "object" &&
            !Array.isArray(defaultVal) &&
            customVal &&
            typeof customVal === "object" &&
            !Array.isArray(customVal)
        ) {
            result[key] = merge(defaultVal, customVal)
        } else {
            result[key] = customVal
        }
    }

    return result
}

export function initStyle(style) {
    return merge(DEFAULT_STYLE, style)
}

export function initInteractivity(interactivity) {
    return merge(DEFAULT_INTERACTIVITY, interactivity)
}