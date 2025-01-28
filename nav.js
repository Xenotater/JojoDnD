var version = {number: "1.12.3.0", date: "1/27/2025"}
var translateData = {};

$(document).ready(function () {
    checkForUpdate();

    let langParam = new URL(window.location.href).searchParams.get("lang");

    if (langParam != null)
        setLangCookie(langParam);
    else if (document.cookie.includes("lang"))
        setLangParam();
    else {
        updateLang("en");
    }

    $(document).on("change", "#lang-select-input", function() {
        updateLang($(this).val());
    });

    getNav();
    translatePage();
    handleHashScroll();
    appendGTM();
});

function getNav() {
    let data = "", path = window.location.pathname;
    $.post("/nav.php", { action: "nav", ads: isAdEnabled(path), langs: getAvailableLangs(path) }, function (data) {
        $("#header").append(data);
        var id = "#" + window.location.pathname.replace(/\//g, "");
        if (id == "#")
            id += "home";
        $(id).addClass("current-nav");
        $("#lang-select-input").val(getLanguage());
    });
}

function isAdEnabled(path) {
    return !(path.includes("recovery") || path.includes("privacy"))
}

function checkForUpdate() {
    if (sessionStorage.getItem("attemptedUpdate"));
        $.post("/update.php", { action: "update", version: version.number }, function (data) {
            if (data == "updated")
                window.location.reload(true);
            else if (window.location.pathname === "/")
                $("#versionInfo").text($("#versionInfo").text().replace("{vNum}", version.number).replace("{vDate}", version.date))
            sessionStorage.setItem("attemptedUpdate", true);
        });
}

function translatePage() {
    const lang = getLanguage(), path = window.location.pathname.replace(/\/$/, "");
    $("html").attr("lang", lang);
    if (lang != "en" && getAvailableLangs(path).includes(lang)) {
        $.getJSON(path + "/translations/" + lang + ".json", function (translation) {
            translateData = translation;
            document.querySelectorAll('*').forEach(element => {
                const key = element.dataset?.translationKey;
                const placeholder = element.placeholder;
                const newText = translation[key ? key : placeholder ? placeholder : $(element).text()];
                if (newText && !placeholder) {
                    $(element).html($(element).html().replace($(element).text().replace("&", "&amp;"), newText));
                    fixScale(element);
                }
                else if (newText && placeholder)
                    element.placeholder = newText;
            });
            if (typeof postTranslate === "function")
                postTranslate();
        });
    }
}

function translateElement(element) {
    if (!element)
        return;

    const key = element.dataset?.translationKey;
    const placeholder = element.placeholder;
    const newText = translateData[key ? key : placeholder ? placeholder : $(element).text()];
    if (newText && !placeholder) {
        $(element).html($(element).html().replace($(element).text().replace("&", "&amp;"), newText));
        fixScale(element);
    }
    else if (newText && placeholder)
        element.placeholder = newText;
    if (element.children.length > 0)
        Array.from(element.children).forEach(child => translateElement(child));
}

function translateText(text) {
    const newText = translateData[text];
    if (newText)
        return newText;
    return text;
}

function fixScale(element) {
    try {
        if (typeof shouldScale === "function")
            if (!shouldScale(element))
                return;

        $(element).css("white-space", "nowrap");
        var size = parseInt(getComputedStyle(element).getPropertyValue('font-size'));
        const parent_styles = getComputedStyle(element.parentElement);
        const parent_width = parseInt(parent_styles.getPropertyValue('width'))
        const parent_padding = parseInt(parent_styles.getPropertyValue('padding-left')) + parseInt(parent_styles.getPropertyValue('padding-right'));
        while(element.offsetWidth + parent_padding >= parent_width && size > 0)
        {
            element.style.fontSize = size + "px";
            size -= 1;
        }
        $(element).css("white-space", "");
    }
    catch {
        return;
    }
}

function isTextInputTag(tagName) {
    const textInputs = ["input", "textarea"]
}

function updateLang(lang) {
    setLangCookie(lang);
    setLangParam();
    window.location.reload();
}

function setLangCookie(lang) {
    document.cookie = "lang=" + lang;
}

function setLangParam() {
    let search = window.location.search.replace(/^\?/, "").replace(/&?lang=[a-z]{2}/, "");
    if (search.length > 0)
        search += "&";
    window.history.replaceState(null, "", '?' + search + 'lang=' + getLanguage() + window.location.hash);
}

function getLanguage() {
    let cookies = document.cookie.split(";");
    if (cookies.length > 0) {
        let langCookie = cookies.find(cookie => cookie.includes("lang"));
        if (langCookie.length > 0)
            return langCookie.split("=")[1];
    }
    return "en";
}

function getAvailableLangs(path) {
    if (path.includes("resources") && !path.includes("community") && !path.includes("patches"))
        return ["uk"];
    return [];
}

function handleHashScroll(offset = 88) {
    if (window.location.hash)
        $("html, body").animate({scrollTop: parseInt($(window.location.hash).offset().top + offset)}, 500);
}

function appendGTM() {
    $("head").append("<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-W4X4DX7H');</script>");
    $("body").prepend("<noscript><iframe src='https://www.googletagmanager.com/ns.html?id=GTM-W4X4DX7H'height='0' width='0' style='display:none;visibility:hidden'></iframe></noscript>");
}