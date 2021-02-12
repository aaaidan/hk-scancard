/**
 * @param {String} str 
 */
function reverse(str) {
    return str.split('').reverse().join('');
}

class ScanCard {
    constructor(el) {
        /** @type {HTMLElement} */
        this.el = el;
        this.digitsEl = this.el.querySelector("#digits");
        this.digits = [...this.el.querySelectorAll("#digits use")].sort((a,b) => a.id.localeCompare(b.id));
        this.symbols = [...this.el.querySelectorAll("symbol")].filter(x => x.id.startsWith('sc')).sort((a,b) => a.id > b.id).map(x => x.id);
    }

    /**
     * 
     * @param {Number | String} code 
     */
    setCode(code) {
        let codeString = this.normalizeCode(code);
        codeString.split('').map(x => parseInt(x)).forEach((x, i) => this.setDigit(i, x));
    }

    /**
     * @param {Number} digitNumber Which digit to update (0...7)
     * @param {Number} digitValue The value (number) to set the digit to (0...9)
     */
    setDigit(digitNumber, digitValue) {
        this.digits[digitNumber].setAttribute("href", `#${this.symbols[digitValue]}`);
    }

    /**
     * Normalizes a number or string into the correct scancard format
     * @param {Number | String} code 
     */
    formatCode(code, {padding = true} = {}) {
        let codeString = this.normalizeCode(code, {padding});
        codeString = reverse(codeString);
        if (codeString.length > 5) {
            codeString = `${codeString.substr(0,3)}-${codeString.substr(3,2)}-${codeString.substr(5,3)}`
        } else if (codeString.length > 3) {
            codeString = `${codeString.substr(0,3)}-${codeString.substr(3,2)}`;
        } else {
            codeString = codeString;
        }
        codeString = reverse(codeString);
        console.log(codeString);
        return codeString;
    }

    normalizeCode(code, {padding = true} = {}) {
        let codeString = code.toString();
        codeString = codeString.replace(/-/g, "");
        if (padding) while (codeString.length < 8) { codeString = "0" + codeString; }
        return codeString;
    }

    random() {
        const symbolId = Math.random() > 0.5 ? "sc3" : "sc7";
        const random = Math.floor(Math.random() * 1000000000).toString().substr(1);
        this.setCode(random);
    }

    setPlaceholder(isPlaceholder) {
        this.digitsEl.style.opacity = isPlaceholder ? "0.5" : "";
    }
}

const scancard = new ScanCard(document.querySelector('#scancard'));


function parseQuery(queryString) {
	var query = {};
	var pairs = queryString.substr(1).split('&');
	for (var i = 0; i < pairs.length; i++) {
        if (pairs[i].length === 0) continue;
		var pair = pairs[i].split('=');
		query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
	}
	return query;
}

function formatCode(code) {
    code.toString().replace("-", '')
}

const queryString = parseQuery(window.location.search);

/**
 * @type {HTMLInputElement}
 */
const codeInput = document.querySelector('#code');
codeInput.addEventListener('input', () => {
    codeInput.value = scancard.formatCode(codeInput.value, { padding: false });

    if (codeInput.value.length) {
        scancard.setCode(codeInput.value);
        scancard.setPlaceholder(false);
    } else {
        scancard.setCode("777-77-777");
        scancard.setPlaceholder(true);
    }

    const codeValue = scancard.normalizeCode(codeInput.value, { padding: false });
    if (codeValue.length) {
        window.history.replaceState(null, document.title, `?code=${codeValue}`);
    } else {
        // strip query string off
        window.history.replaceState(null, document.title, location.href.substr(0, location.href.length - location.search.length));
    }
});

if (queryString.code) {
    codeInput.value = scancard.formatCode(queryString.code);
    scancard.setCode(codeInput.value);
}
scancard.setPlaceholder( codeInput.value.length == 0 );