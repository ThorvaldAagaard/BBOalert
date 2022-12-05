function setSuitColors () {
    document.querySelectorAll("*").forEach(function (e) {
        try {
            e.innerHTML = e.innerHTML.replaceAll("!C", '<span style="color: lightgreen; font-size: larger;">♣</span>');
            e.innerHTML = e.innerHTML.replaceAll("!D", '<span style="color: orange; font-size: larger;">♦</span>');
            e.innerHTML = e.innerHTML.replaceAll("!H", '<span style="color: red; font-size: larger;">♥</span>');
            e.innerHTML = e.innerHTML.replaceAll("!S", '<span style="color: blue; font-size: larger;">♠</span>');
        }
        catch { }
    })
}
setSuitColors();
