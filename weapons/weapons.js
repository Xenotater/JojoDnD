var wData, weapons, sortType = "name", reverse = false;

$(document).ready(function() {
    var url = new URL(window.location.href);
    var q = url.searchParams.get("search");

    getData(q);

    $("#weapon-list").on("mouseenter", ".attr", function(e) {
        hintText = hint($(this).html());
        popUp(hintText, e.pageX, e.pageY)
    });
    $("#weapon-list").on("mouseleave", ".attr", function() {
        $("#popUp").remove();
    });
    $("#weapon-list").on("scroll", function() {
        $("#popUp").remove();
    });

    $("#weapon-list").on("click", ".sorter", function() {
        var btn = $(this);
        var id = btn.attr("id");

        if (id.includes("Down")) {
            if (btn.hasClass("bi-caret-down")) {
                var current = $(".bi-caret-down-fill");
                current.removeClass("bi-caret-down-fill");
                current.addClass("bi-caret-down");
                current = $(".bi-caret-up-fill");
                current.removeClass("bi-caret-up-fill");
                current.addClass("bi-caret-up");

                btn.removeClass("bi-caret-down");
                btn.addClass("bi-caret-down-fill");
                sortType = id.replace("Down", "");
                reverse = true;
                updateTable();
            }
        }
        else {
            if (btn.hasClass("bi-caret-up")) {
                var current = $(".bi-caret-down-fill");
                current.removeClass("bi-caret-down-fill");
                current.addClass("bi-caret-down");
                current = $(".bi-caret-up-fill");
                current.removeClass("bi-caret-up-fill");
                current.addClass("bi-caret-up");
                
                btn.removeClass("bi-caret-up");
                btn.addClass("bi-caret-up-fill");
                sortType = id.replace("Up", "");
                reverse = false;
                updateTable();
            }
        }
    });

    $("#search").on("input", function () {
        search($(this).val());
        updateURL($(this).val()); 
    });
});

function getData(q) {
    $.getJSON("weapons.json", function(data) {
        wData = data.weapons;
        weapons = wData;
        sort("name");
        createTable();
        $("#nameUp").removeClass("bi-caret-up");
        $("#nameUp").addClass("bi-caret-up-fill");

        if (q != null) {
            $("#search").val(q);
            search(q);
        }
    });

    $("#weapon-list").html("<div class='loading'></div>");
}

function createTable() {
    var newText = "<div data-simplebar><table class='table table-striped'><thead><tr>";
    newText += "<th><div class='label attr'>Name</div><div class='sortBtns'><i id='nameUp' class='bi bi-caret-up sorter'></i><br><i id='nameDown' class='bi bi-caret-down sorter'></i></div></th>";
    newText += "<th><div class='label attr'>Attributes</div><div class='sortBtns'><i id='attrUp' class='bi bi-caret-up sorter'></i><br><i id='attrDown' class='bi bi-caret-down sorter'></i></div></th>";
    newText += "<th><div class='label attr'>Type</div><div class='sortBtns'><i id='typeUp' class='bi bi-caret-up sorter'></i><br><i id='typeDown' class='bi bi-caret-down sorter'></i></div></th>";
    newText += "<th><div class='label attr'>Specialization</div><div class='sortBtns'><i id='specUp' class='bi bi-caret-up sorter'></i><br><i id='specDown' class='bi bi-caret-down sorter'></i></div></th>";
    newText += "<th><div class='label attr'>Stat/DC</div><div class='sortBtns'><i id='statUp' class='bi bi-caret-up sorter'></i><br><i id='statDown' class='bi bi-caret-down sorter'></i></div></th>";
    newText += "<th><div class='label attr'>Prerequisite</div><div class='sortBtns'><i id='prereqUp' class='bi bi-caret-up sorter'></i><br><i id='prereqDown' class='bi bi-caret-down sorter'></i></div></th>";
    newText += "<th><div class='label attr'>Damage</div><div class='sortBtns'><i id='dmgUp' class='bi bi-caret-up sorter'></i><br><i id='dmgDown' class='bi bi-caret-down sorter'></i></div></th>";
    newText += "</tr></thead><tbody></tbody></table></div>";

    $("#weapon-list").html(newText);
    updateTable();
}

function updateTable() {
    var newText = "";
    
    sort();
    if (reverse)
        weapons.reverse();
    
    for (let i = 0; i < weapons.length; i++) {
        w = weapons[i];
        newText += "<tr><td>" + w.name + "</td><td>";
        for (let j = 0; j < w.attr.length; j++) {
            newText += "<span class='attr'>" + w.attr[j] + "</span>"
            if (j < w.attr.length - 1)
                newText += ", "
        }
        newText += "</td><td>" + w.type + "</td><td>" + w.spec + "</td><td>" + w.stat + "</td><td>" + w.prereq + "</td><td>" + w.dmg + "</td></tr>";
    }
    newText += "</tbody></table>";

    $("#weapon-list tbody").html(newText);
}

function hint(attr) {
    if (attr.includes("Thrown") || attr.includes("Ranged")) {
        var range = attr.substring(attr.indexOf('(') + 1, attr.indexOf(')')).split('/');
        attr = attr.substring(0, attr.indexOf(' '));
    }
    if (attr.includes("Reach") || attr.includes("Radius")) {
        var dist = attr.substring(attr.indexOf('(') + 1, attr.indexOf(')'));
        attr = attr.substring(0, attr.indexOf(' '));
    }
    if (attr.includes("Reload")  || attr.includes("Burst")) {
        var ammo = attr.substring(attr.indexOf('x') + 1, attr.indexOf(')'));
        attr = attr.substring(0, attr.indexOf(' '));
    }
    if (attr.includes("Concealed") || attr.includes("Versatile")) {
        var bonus = attr.substring(attr.indexOf('(') + 1, attr.indexOf(')'));
        attr = attr.substring(0, attr.indexOf(' '));
    }

    switch(attr) {
        case "Name": 
            return("The name of the weapon.");
        case "Attributes":
            return("The properties that the weapon has.");
        case "Type":
            return("The type of weapon for the purpose of Proficiencies.");
        case "Specialization":
            return("The type of the weapon for the purpose of Specialization Feats.")
        case "Stat/DC":
            return("The Attack Stat or DC of the weapon. The Attack Stat is added to both to-hit AND damage rolls. If the weapon has a DC, a Dex Save must be rolled and half damage is taken on success.");
        case "Prerequisite":
            return("The requirement that must be met in order to use the weapon.");
        case "Damage":
            return("The damage the weapon deals when it hits.");
        case "Melee":
            return("This weapon has a range of 1m from the person/stand wielding it.");
        case "Reach":
            return("This weapon has a range of " + dist + " from the person/stand wielding it.");
        case "Two-Handed":
            return("This weapon requires two hands to wield. Using this weapon to make an Attack with only 1 hand inflicts Disadvantage.<br>Difficult to holster or conceal.");
        case "Thrown":
            if (range[0] != range[1])
                return("This weapon can be thrown up to " + range[0] + "m, or as far as " + range[1] + "m with Disadvantage.<br>Once thrown, this weapon must be picked up in order to be used again (unless it is an explosive, in which case it is destroyed).");
            else
                return("This weapon can be thrown up to " + range[0] + "m.<br>Once thrown, this weapon must be picked up in order to be used again (unless it is an explosive, in which case it is destroyed).")
        case "Ranged":
            return("This weapon can fire up to " + range[0] + "m, or as far as " + range[1] + "m with Disadvantage.<br>Firing within melee range imposes Disadvantage.");
        case "Firearm":
            return("This weapon makes a loud sound which can be heard up to 0.5km away.<br>It also jams if a natural 1 is rolled while using it.<br>This weapon's ammuntion doesn't function when wet.");
        case "Reload":
            return("This weapon can be used " + ammo + " times before needing to be reloaded.<br>Reloading takes a full Attack.");
        case "Shield":
            return("This item grants a bonus to AC but lowers your movement speed.<br>You may not equip more than one shield at once.");
        case "Explosive":
            return("This weapon is destroyed once used. Damage is dealt in a radius around the target.<br>Explosives may be used to set traps, not just as thrown/propelled weapons.<br>Those caught within the blast radius make a Dex Save with a DC of " + dc + ", taking half damage on success.<br>If a 1 is rolled while throwing, the explosive goes off centered on the user.");
        case "Burst":
            return("This weapon consumes " + ammo + " of it's ammo each time it is fired.")
        case "Concealed":
            return("This weapon grants " + bonus + " to any Check made to conceal it.");
        case "Light":
            return("This weapon is light and easy to handle, allowing you to wield another weapon in your other hand.");
        case "Remote":
            return("This weapon can be detonated as a Bonus Action from up to 1km away.");
        case "Timer":
            return("A timer may be set on this weapon, detonating it once the timer runs out. The timer may be set for up to 12 hours.");
        case "Radius":
            return("This weapon forces all creatures within " + dist + " of the target to make a Dexterity Saving Throw, taking half damage on success and full damage on failure.");
        case "Siege":
            return ("This weapon deals double damage to objects.");
        case "Reliable":
            return("This weapon does not jam if you roll a natural 1.");
        case "Point Blank":
            return("This weapon does not grant Disadvantage if fired within melee range.<br>Additionally, this weapon grants Advantage when aiming at a Prone target within melee range.");
        case "Ambush":
            return("This weapon always crits when attacking a Surprised target.");
        case "Bulky":
            return("This weapon must be braced using a Bonus Action in order to begin firing.");
        case "Complex":
            return("This weapon takes a total of three Attacks to reload.");
        case "Flame":
            return("When a targeted creature or object takes fire damage from this weapon, it is set ablaze (assuming the target is flammable).");
        case "Versatile":
            return("This weapon may be wielded with one or two hands. If two hands are used, it's damage becomes " + bonus + ".");
        default:
            return("Error: This attribute doesn't have a definition. Please alert the site administrator.");     
    }
}

function popUp(text, posX, posY) {
    $("#popUp").remove(); //just in case
    $("body").append("<div class='content' id='popUp'><p>" + text + "</p></div>");
    $("#popUp").css("left", posX + 25);

    //ensure popUp doesn't go past navbar
    if (posY - $("#popUp").outerHeight() > $("nav").position().top + 88)
        posY -= $("#popUp").outerHeight();
    else
        posY -= .5 * $("#popUp").outerHeight();

    $("#popUp").css("top", posY - 25);
}

//sort-by-key from https://stackoverflow.com/questions/8175093/simple-function-to-sort-an-array-of-objects
function sort() {
    weapons.sort(function (a, b) {
        var x = a[sortType]; var y = b[sortType];
        if (x == "None" || x.includes("DC"))
            x = "A";
        if (y == "None" || y.includes("DC"))
            y = "A";
        if (sortType == "dmg") {
            x = diceParse(x);
            y = diceParse(y);
        }
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

function diceParse(s) {
    var val = s.match(/^.d.+ /);
    var add = s.match(/^.d.+ \+ [0-9]+/);

    if (add != null)
        add = parseInt(add[0].substring(add[0].indexOf("+") + 2, add[0].length));
    else add = 0;

    if (val != null) {
        num = val[0].substring(0, val[0].indexOf('d'));
        die = val[0].substring(val[0].indexOf('d') + 1, val[0].indexOf(' '));
        var avg = num * ((die/2) + 0.5) + add;
        return avg;
    }
    else
        return 0;
}

function search(query) {
    var not = false;
    weapons = [];

    if (query.match(/^NOT */)) {
        not = true;
        query = query.replace(/^NOT */, "");
    }

    for (let i = 0; i < wData.length; i++) {
        var matched = false;
        for (var key in wData[i]) {
            var attr= "";
            attr += wData[i][key];
            if (attr.toLowerCase().includes(query.toLowerCase()))
                matched = true;
        }
        if ((matched && !not) || (!matched && not))
            weapons.push(wData[i]);
    }

    updateTable();
}

function updateURL(query) {
    if (query != "")
        window.history.replaceState(null, "", '?search=' + query);
    else
        window.history.replaceState(null, "", window.location.pathname);
}