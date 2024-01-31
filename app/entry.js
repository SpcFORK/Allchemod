const
  centerStyle = {
    "position": "absolute",
    "top": "50%",
    "left": "50%",
    "transform": "translate(-50%, -50%)"
  }

window.Main = class Main {

  static PageTitle = 'Allchemod';

  /*
    This class automatically inherits:
      - The entry element,
      - The page pathname,
      - The file location.

    this.entry, this.path, this.entryPath,
  */

  static async preload() {
    return await new Promise((resolve, reject) => {
      // Load image
      const AllchemyLogo = new Image();
      AllchemyLogo.src = 'allchemyLogo.png';
      AllchemyLogo.onload = () => {
        resolve(AllchemyLogo);
      }
    });
  }

  version = '0.0.7';

  marklet = `javascript:(function()%7Bfunction loadScript(url) %7B%0A  return new Promise((resolve%2C reject) %3D> %7B%0A    const script %3D document.createElement('script')%3B%0A    script.src %3D url%3B%0A    script.onload %3D resolve%3B%0A    script.onerror %3D reject%3B%0A    document.head.appendChild(script)%3B%0A  %7D)%3B%0A%7D%0A%0Afunction loadCss(url) %7B%0A  return new Promise((resolve%2C reject) %3D> %7B%0A    const link %3D document.createElement('link')%3B%0A    link.rel %3D 'stylesheet'%3B%0A    link.href %3D url%3B%0A    link.onload %3D resolve%3B%0A    link.onerror %3D reject%3B%0A    document.head.appendChild(link)%3B%0A  %7D)%0A%7D%0A%0A%2F%2F ---%0A%0Aconst domain %3D 'https%3A%2F%2Fallchemod.replit.app%2F'%0A%0A%7B%0A  (async () %3D> %7B%0A    await loadScript(domain %2B 'script.js')%0A    await loadCss(domain %2B 'style.css')%0A  %7D)()%0A%7D%7D)()%3B`

  title = h1(this.constructor.PageTitle)
  smallVersion = small('v' + this.version)
  desc1 = p('A cool mod for Allchemy.')
  desc2 = pre().appendChildren$(
    'This mod is a work in progress.',
    br(),
    br(),
    'You bookmark the BUTTON LINK and then click the ',
    br(),
    i(b('bookmarklet (The link you saved to your bar)')),
    br(),
    br(),
    b('when on the game page to start the mod.')
  )

  button1 = a(button().html$('Right Click & Bookmark me!!<br/>OR Drag me to your Bookmark Bar!!')).att$('href', this.marklet)
    .on$('click', () => {
      this.button1.html$(`
      
        Not on this page,<br/>
        <br/> 
        Please bookmark this text (I AM A LINK),<br/> 
        Then; Goto your game window, <br/>
        <span class="highlightspan">
        now, click the bookmarked bookmarklet!!
        </span><br/>
        <br/>
      `)
    })

  center = div(
    this.title,
    this.smallVersion,
    br(),

    hr(),

    this.desc1,
    br(),
    this.desc2,

    hr(),
    br(),

    this.button1
  ).style$(centerStyle)


  constructor(entry, AllchemyLogo) {
    AllchemyLogo = new SushaWrapper(AllchemyLogo);

    AllchemyLogo.style$({
      ...centerStyle,

      top: "20%",
      transform: centerStyle.transform + ' scale(0.9)',
      // Blur edges of img,
      'border-radius': '50%',
    })

    entry.append(
      div(
        AllchemyLogo,
        this.center
      ).get$()
    )
  }

}