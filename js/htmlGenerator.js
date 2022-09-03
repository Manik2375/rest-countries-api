export function cardHTMLGenerator({ name, flagSrc, population, region, capital }) {
    return `<article tabindex="0" class="country-card primary-bg">
    <div class="country-flag-container">
        <img src="${flagSrc}" alt="${name} flag" class="country-flag" loading="lazy" width="300" height="200" />
    </div>
    <div class="country-detail">
        <h1>${name}</h1>
        <dl class="country-property-list">
            <div>
                <dt class="country__property">Population</dt>
                <dd class="country__property-value">${population}</dd>
            </div>
            <div>
                <dt class="country__property">Region</dt>
                <dd class="country__property-value">${region}</dd>
            </div>
            <div>
                <dt class="country__property">Capital</dt>
                <dd class="country__property-value">${capital}</dd>
            </div>
        </dl>
    </div>
</article>`
}
export function detailPageHTMLGenerator({ name, flagSrc, borderCountries, properties }) {
    const borderCountriesHTML = borderCountries?.map((country) => ` <li><button class="primary-btn primary-bg" data-country="${country}">${country}</button></li>`).join("") ?? "No border countries"

    return `<div class="country-page secondary-bg">
    <div class="country-page__functions-container">
        <button class="country-page__back-btn primary-btn primary-bg">
            Back
        </button>
    </div>
    <div class="country-page__flag-container">
        <img src="${flagSrc}" alt="${name} flag">
    </div>
    <div class="country-page__detail-container">
        <h2 class="country-page__country-name">${name}</h2>
            <dl class="country-property-list country-page__property-list">
               
                <div> 
                    <dt class="country__property">Native Name</dt>
                    <dd class="country__property-value">${properties.nativeName}</dd>
                </div>
                <div> 
                    <dt class="country__property">Population</dt>
                    <dd class="country__property-value">${properties.population}</dd>
                </div>
                <div>
                    <dt class="country__property">Region</dt>
                    <dd class="country__property-value">${properties.region}</dd>
                </div>
                <div> 
                    <dt class="country__property">Sub Region</dt>
                    <dd class="country__property-value">${properties.subRegion}</dd>
                </div>
                <div>
                    <dt class="country__property">Capital</dt>
                    <dd class="country__property-value">${properties.capital}</dd>
                </div>
                <div>
                    <dt class="country__property">Top Level Domain</dt>
                    <dd class="country__property-value">${properties.tld}</dd>
                </div>
                <div>
                    <dt class="country__property">Currencies</dt>
                    <dd class="country__property-value">${properties.currencies}</dd>
                </div>
                <div>
                    <dt class="country__property">Languages</dt>
                    <dd class="country__property-value">${properties.languages}</dd>
                </div>
            </dl>
            <div class="border-country">
                <h3>Border Countries:</h3>
                <ul class="border-country__list">
                    ${borderCountriesHTML}
                </ul>
            </div>
    </div>
</div>`
}