export function normalizeDomain(url: string): string | null {
    if (!url) return null;
    try {
        let fullUrl = url;
        if (url.startsWith('//')) {
            fullUrl = 'https:' + url;
        } else if (!url.startsWith('http')) {
            fullUrl = 'https://' + url;
        }
        const domain = new URL(fullUrl).hostname;
        return domain.replace(/^www\./, '').toLowerCase();
    } catch {
        console.warn('⚠️ URL inválida:', url);
        return null;
    }
}

export function getKeywordLimit(subscriptionPlan: string): number {
    switch (subscriptionPlan) {
        case 'Basico': return 250;
        case 'Pro': return 500;
        case 'Ultra': return 7;
        default: return 0;
    }
}

export function getScanMapBaseLimit(subscriptionPlan: string): number {
    switch (subscriptionPlan) {
        case 'Basico': return 5;
        case 'Pro': return 10;
        case 'Ultra': return 25;
        default: return 0;
    }
}