# **Laboratorium: Cross-Site Scripting**

## 1. Cel zajęć
Dzisiejsze laboratorium ma pokazać, jak **niebezpieczne** przetwarzanie danych wejściowych od użytkownika może umożliwiać wykonanie **niechcianego** kodu JavaScript w przeglądarce. Będzie można zobaczyć, jak w **praktyce** wygląda taki atak oraz **formy**, które może przybrać.

## 2. Konfiguracja środowiska
Ze względów **bezpieczeństwa** nie zdecydowaliśmy się na hostowanie strony testowej w miejscu dostępnym dla całej grupy oraz na stworzenie backendu, więc aby móc wykonać przygotowane ćwiczenia, **należy** wykonać poniższe kroki:

1. **Sklonować** to repozytorium lub pobrać archiwum ZIP.
2. Upewnić się, że ma się zainstalowany **interpreter** Pythona komendą: `python3 --version`, a jeśli okaże się, że nie, to **zainstalować** go.
3. **Przejść** do katalogu *strona*.
4. **Uruchomić** lokalny serwer WWW komendą `python3 -m http.server`.
5. W przeglądarce **wejść** pod adres http://127.0.0.1:8000.
6. Z tego poziomu ma się do wyboru **cztery** ćwiczenia dotyczące XSS.

## 3. Prezentacja
Nasza prezentacja jest w **całości** wykonana w HTML, CSS oraz JavaScript, więc aby móc ją przeglądać, należy uruchomić w **przeglądarce** plik *XSS.exe.html*.

## 4. Ćwiczenia

Celem każdego ćwiczenia jest **wykonanie** kodu JS. Dla zadania o numerze x należy wywołać funkcję `alert(x)`, aby zdobyć **flagę**. Wolno korzystać **wyłącznie** z obecnych pól wprowadzania tekstu od użytkownika. Dla przypomnienia, w HTML używane są tagi `<script>` oraz `</script>`do otaczania poleceń języka JavaScript, które mają się **wykonać**.

### Zadanie 1. DOM-based XSS (łatwiejsze)
Ta prosta strona oferuje jedynie możliwość przeszukiwania asortymentu sklepu za pośrednictwem formularza z tagiem `<input>` w HTML. Spróbuj spreparować taki **payload**, który zmusi przeglądarkę do wyświetlenia alertu na ekranie.

<details>
<summary>Rozwiązanie (kliknij, aby rozwinąć)</summary>

Wpisz w polu wyszukiwania: `<script>alert(1)</script>`.
</details>

### Zadanie 2. DOM-based XSS (trudniejsze)
Podobna sytuacja co w zadaniu 1., ale tym razem twórca wyszukiwarki katalogowej pamiętał o podstawowej **sanityzacji** danych wejściowych za pomocą metody
`replace("<script>","")`. Wyświetl teraz **alert o treści "2"**.

<details>
<summary>Rozwiązanie (kliknij, aby rozwinąć)</summary>

Wpisz w polu wyszukiwania: `<scr<script>ipt>alert(2)</script>`. Zauważ, że po wycięciu znacznika `<script>` znaki po jego lewej i prawej stronie **skleją się**, tworząc identyczny znacznik.
</details>

### Zadanie 3. Stored XSS (łatwiejsze)
Tym razem masz do czynienia z **niebezpieczną** implementacją komentarzy na forum społecznościowym. Wprowadzanie danych odbywa się przez formularz z tagami `<input>` oraz `<textarea></textarea>`. Zamieść komentarz, który po każdym **odświeżeniu** lub **ponownym uruchomieniu** strony, wyświetli **alert(3)**.

<details>
<summary>Rozwiązanie (kliknij, aby rozwinąć)</summary>

Wpisz w polu z pseudonimem lub komentarzem: `<script>alert(3)</script>` **ORAZ** odśwież / uruchom ponownie stronę.
</details>

### Zadanie 4. Stored XSS (trudniejsze)
Analogicznie do zadania 3. zapisz w **bazie danych** CyberForum (w naszym przypadku w **localStorage**) złośliwy komentarz. Miej na uwadze, że tym razem zastosowano **rekursywne** usuwanie znaczników `<script>`. Oznacza to, że po każdym usunięciu tego fragmentu, tekst jest **znowu** sprawdzany pod kątem jego **obecności**.

<details>
<summary>Rozwiązanie (kliknij, aby rozwinąć)</summary>

Skoro taka sztuczka jak w zadaniu 2. już **nie przejdzie**, to spróbujmy czegoś innego. Wpisz w polu z nickiem lub wiadomością: `<img src="x" onerror="alert(4)">` ORAZ odśwież / uruchom ponownie stronę. Ten znacznik próbuje załadować obrazek o nazwie "x", a skoro taki **nie istnieje**, przeglądarka natychmiast uruchamia zdarzenie **onerror**.
</details>