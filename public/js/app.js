/**
 * App Router - Main SPA Controller
 * Bancada Sistema Padeiro
 */
const App = {
  version: '1.0',
  currentRoute: 'login',
  getLogoSvg(whiteText = false) {
    return `
<svg id="Camada_1" data-name="Camada 1" xmlns="http://www.w3.org/2000/svg" viewBox="50 250 700 280" style="height: 100%; width: auto;">
  <defs>
    <style>
      .cls-1 { fill: ${whiteText ? '#ffffff' : '#ca5d43'}; }
      .cls-2 { fill: ${whiteText ? '#ffffff' : '#c85946'}; }
      .cls-3 { fill: ${whiteText ? '#ffffff' : '#d26856'}; }
      .cls-4 { fill: ${whiteText ? '#ffffff' : '#ffffff'}; }
      .cls-5 { fill: ${whiteText ? '#ffffff' : '#ca5b47'}; }
      .cls-6 { fill: ${whiteText ? '#ffffff' : '#ca5c42'}; }
      .cls-7 { fill: ${whiteText ? '#ffffff' : '#c95b44'}; }
      .cls-8 { fill: ${whiteText ? '#ffffff' : '#c85f49'}; }
      .cls-9 { fill: ${whiteText ? '#ffffff' : '#d35e47'}; }
      .cls-10 { fill: ${whiteText ? '#ffffff' : '#c65844'}; }
      .cls-11 { fill: ${whiteText ? '#ffffff' : '#cb5c47'}; }
      .cls-12 { fill: ${whiteText ? '#ffffff' : '#cb5843'}; }
    </style>
  </defs>
  <path class="cls-12" d="M251.49,445.81c.31,10.9,1.53,27.6-3.87,36.84-4.17,7.13-9.84,13.49-15.89,19.14-3.86,3.6-8.42,5.48-13.32,6.84-6.12,1.69-11.92,2.77-18.23,4-25.54,4.98-50.98,7.85-77.01,8.88-11.99.47-27.87,2.99-36.56-6.21-3.95-4.18-6.45-9.38-8.17-15.02-5.43-17.79-9.26-35.75-11.01-54.38-1.23-13.15-2.13-25.81-1.17-38.89.56-7.68,5.27-14.09,10.57-19.11,3.95-3.74,7.54-7.08,11.66-10.56,3.47-2.92,7.46-5.12,11.95-6.25s9.1-2.13,13.92-2.9c28.55-4.6,54.18-8.21,83.48-8.93,1.86-9.43,8.18-13.29,15.04-19.11-3.36-3.93-5.89-8.09-6.06-13.13l-3.49-.43c-.27-.03-.88-.71-1-.95-.17-.32.63-1.08,1-1.1l3.57-.23.83-3.62-3.31-1.57c-.36-.17-.87-1.11-.71-1.41.21-.37,1.23-.83,1.65-.69l3.29,1.11c2.16-4,5.04-7.06,8.83-9.7l2.7-5.29c2.11-4.13,5.01-7.74,8.69-10.41,4.94-3.59,9.17,8.56,9.75,12.07,5.27,1.05,10.18,3.18,14.48,6.51,4.17-2.8,8.78-4.47,13.73-4.69,2.33-.1,3.85,1.02,4.17,3.51.9,6.95-1.2,13.79-4.7,20.05.04,4.04-.29,7.77-2,11.65l2.81,2.42c-1.28,2.19-3.77-.23-4.45.48l-1.27,1.33c-.45.47-1.09,1.2-1.38,1.62-.71,1.02,1.58,2.24,1.03,3.78-.15.43-1.53.47-1.84.14l-1.78-1.87-2.89,1.86c4.74,10,7.78,17.55,8.02,28.7,1.44-.57,2.99-1.43,3.84-2.48,6.69-8.31-.09-14.48,5.56-24.69,2.29-4.14,5.02-7.07,9.4-9.01,3.94-1.75,9.01-1.84,11.72,2.19,2.11,3.13,1.08,8.23-2.19,10.17-6.88,4.08-8.54,5.05-9.47,13.91-1.39,13.19-9.62,20.68-22.83,21.8-4.26,4.9-6.02,6.69-12.6,8.58,2.92,14.98,5.09,29.78,5.53,45.06ZM223.4,372.6c1.53,1.22,2.7-2.5,4.69-2.2.36.09.34,1.19.13,1.49l-.9,1.31c5.19-.68,10.26-3.52,14.29-6.56.39-.3,1.36-.39,1.72-.43s1.06,1.28.77,1.61c-1.42,1.67-4.32,3.85-6.34,5.13,3.12,8.03,5.4,15.97,7.51,24.47,6.37-1.57,10.85-6.71,12.71-13.17,2.91-10.11-1.97-22.18-6.29-31.59-3.18.46-6.32.6-9.24-.04-.46-.1-1.33-1.12-1.02-1.38,2.59-2.17,9.19-.57,13.73-4.02l-2.13-3.18c-.19-.29-.3-1.04-.24-1.36s1.17-.33,1.43-.11l3.15,2.64c.85.27,2.51-1.74,2.25-2.52l-3.72-1.8c-.37-.18-.89-1.35-.55-1.53.25-.14,1.14-.43,1.43-.35l4.33,1.28c2.76-2.92.98-7.2,2.26-10.41,2.66-6.65,5.78-13.05,4.38-20.49-5.14.54-9.73,2.37-14.29,5.01-1.17-.06-2.73-1-3.74-1.8-8.28-6.52-18.59-4.31-14.16-7.64-.69-3.22-2.22-6.8-4.4-9.59-3.86-.3-9.28,10.53-10.72,13.72-.74,1.64-2.61,2.62-4,3.84-2.02,1.76-3.63,4.28-4.91,6.64l1.32,1.75c.18.24.33.95.36,1.24s-.88.21-1.26.15c-.88-.16-1.64.08-1.65.86,0,.45.63,1.06,1.08,1.4l1.04.79c.98.75-2.79.62-2.32,2.37,1,3.76,2.5,6.81,5.06,9.57l6.33,6.82c-.54.64-2.12.65-2.79.2l-3.65-2.42c-5.93,4.31-13.06,10.4-13.92,17.79,1.25-1.23,1.59-1.84,2.81-2.4l-.89,4c-.1.47.45,1.55.87,1.5,1.54-.2,1.06-3.67,2.85-4.48,1.92.24.69,2.41.18,3.59,3.86-1.1,5.07-7.15,7.5-8.22.69.29,1.41,1.73,1.15,2.29l-1.08,2.32c3.52.22,6.56.7,10.23,1.66l7.48-3.15c.44-.19,1.89.27,1.89.7.04,2.16-7.54,3.49-12.03,10.18-.16.24-.32.85-.35,1.05-.02.13.22.24.34.16l.76-.48c.66-.41,1.54-.72,2.61-.7-.26,1.82-3.7,3.17-2.04,4.5ZM260.49,388.56c11.73-1.39,16.92-9.36,17.73-20.56.28-3.9,1.53-7.21,4.32-10.07l-3.74-5.24c-.33-.46-1.36-1.12-1.89-1.09s-1.45.84-1.69,1.33c-2.07,4.19-2.71,8.36-2.34,12.97.64,8.04-2.7,15.81-10.94,18.29-.59,1.29-1.06,2.72-1.45,4.37ZM176.87,364.58l.1-2.52c-.46.42-1.06.92-.93,1.23s.5.82.83,1.29ZM122.69,499.06c14.62-.71,28.8-1.17,43.4-2.78,14.52-1.6,55.39-7.13,67.52-11.62,2.56-.95,5.34-2.48,6.89-4.66,2.79-3.92,3.64-8.54,3.78-13.36.38-12.76.05-25.19-1.37-37.89-1.98-17.7-5.51-36.06-11.88-52.79l-4.47.53c-2.74.32-5.93-1.14-7.44-3.48-1.38-2.14-.55-4.52.22-6.95-3.91,0-8.16-.54-11.76.43-2.63.71-4.48-.32-6.86-.25-31.5.92-62.63,4.7-93.57,10.61-7.18,1.37-13.72,3.47-15.6,11.59-1.47,6.37-1.65,12.78-1.66,19.35l-.02,11.86c-.03,17.02,6.47,56.61,14.47,72.95-.49,1.93-2.08,4.04-3.41,5.69l-8.84,10.97c-1.13,1.4-1.04,3.49.13,4.34s3.29.52,4.34-.71l13.15-15.44,5.87,1.12c2.21.42,4.72.6,7.13.48ZM83.08,396.84c-.25-1.23-.3-1.66-.44-1.56-.17.12-.75.56-.73.56.01,0,.44.39.57.5.45.36.85.69.61.5ZM82.3,418.35c-.28-.93-1.13-1.45-2.05-1.05l2.05,1.05ZM78.61,421.95l.06-2.39c-.35.27-1.01.86-.85,1.12l.79,1.27ZM74.48,425.25c.18.11.7-.8.51-.81l-1.53-.06c-.52-.2.27.41,1.02.87ZM75.79,450.27l.95-.17c.24-.04.02-.77-.17-.92s-.36,0-1.38.39l.6.7ZM84.17,457.91l-1-.22c-.65.63-.72.59-.63.77s.39,1.11.51.95l1.11-1.5ZM80.95,464.3c.21.03,1.5.1,1.34-.08l-.69-.78c-.11-.12-.37.19-.88.69-.84-.02-.7.03.23.17ZM81.1,467.55c-1.56-1.32-3.23.63-3.22,1.73,1.2-.95,1.96-1.34,3.22-1.73ZM85.74,473.52l.29-1.27c.06-.27-.3-.41-1.08-.7l.79,1.97ZM94.53,486.19l-2.41.13c.82,1.31,2.05.86,2.41-.13ZM87.91,487.54l-1.43-.9s.28.91.35,1.15,1.03-.11,1.08-.26ZM187.04,499.76l.08,1.3c.01.18.75-.08.75-.26l.03-.89c0-.18-.87-.32-.85-.15ZM112.74,515.14c.83.18-.13-.13-.26-.03l-.72.54c-.2.15-.3.91-.06,1.01.27.11.81.15.84-.1l.2-1.42Z"/>
  <path class="cls-11" d="M493.66,459.54l-2.12-17.27-2.3-18.7-9.87,29.67c-.58,1.76-2.44,3.26-4.23,3.68-3.79.9-10.7,1.33-12.55-3.25l-10.97-27.05-1.52,13.27-2.14,19.08c-.37,3.34-2.18,6.16-6.11,6-4.43-.19-8.98-1-13.45-1.92-2.63-.54-4.58-3.06-4.16-5.94l3.49-23.97,5.2-34.64c.38-2.53.63-5.08,1.74-7.38,1.75-3.62,13.08-2.98,16.69-2.72,1.57.11,3.76,1.07,4.43,2.51l8.2,17.65,7.19,15.81,5.01-12.48,6.62-15.58c2.81-6.61,4.49-6.19,10.77-6.43,6.49-.25,13.58-.9,14.61,5.7l1.9,12.13,3.66,22.12,4.28,27.74c.67,4.31-3.02,6.79-6.78,6.95-7.07.32-16.68,2.55-17.6-4.99ZM494.62,395.37l.82.99c.1.12.36.05.36-.1,0-.41,0-1.28-.15-1.09-.1.13-1.12.09-1.02.21ZM497.81,401.47c.63-.39,1.17-.58,1.01-.82s-.78-1.15-.53-.78l-.61,1c-.09.14.12.66.13.6ZM490.22,417.14c.89,0,1.28.05,1.26-.14s-.08-.73-.08-.66c0,.03-.42.03-1.17.03v.77ZM438.7,426.8c.03-1.02-.95-1.97-1.75-1.58l1.75,1.58ZM478.76,429.01c-.52-1.11-1.54-1.66-2.2-.69l2.2.69ZM440.19,443.68c-.75-.71-1.49-1.04-1.98-.81.45.9,1.69,1.42,1.98.81Z"/>
  <path class="cls-9" d="M417.51,427.39c0,21.54-17.48,39-39.04,39s-39.04-17.46-39.04-39,17.48-39,39.04-39,39.04,17.46,39.04,39ZM388.37,441.61c7.8-6.8,7.24-22.56-1.36-28.68-3.05-2.17-7.35-3.13-11.08-2.51-7.29,1.23-11.94,7.29-12.97,14.34s.69,13.79,6.51,17.94c4.87,3.47,13.97,3.22,18.9-1.08Z"/>
  <path class="cls-1" d="M647.09,462.71c-9.33,2.55-21.82,3.12-31.79,2.84-2.96-.08-7.11-1.66-7.25-5.27l-1.23-31.61-.97-30.31c-.13-4.06,2.15-6.98,6.4-7.51,7.96-.98,16.15-.92,24.24-.12,20.7,2.06,37.88,12.14,39.47,34.59.93,13.11-5.52,25.55-16.88,32.13-3.9,2.26-7.65,4.08-11.98,5.26ZM656.22,405.03c-.12.36.43,1.34.7.92.13-.2.68-.74.45-.74s-1.08-.4-1.15-.18ZM661.7,408.06l-2.31-1.26c.35,1.24,1.04,1.8,2.31,1.26ZM642.57,441.94c8.63-2.53,13.55-11.39,10.31-19.63-1.32-3.35-3.69-6.57-6.8-8.23-5-2.68-10.5-3.82-16.01-2.55l-.57,30.22c-.01.57,1.19,1.83,1.76,1.8,3.78-.23,7.55-.5,11.31-1.6ZM621.68,458.54v-1.89s-.9.8-.9.8c-.18.17.36.62.9,1.09Z"/>
  <path class="cls-10" d="M715.72,451.65l-11.91.59-1.7,6.84c-.47,1.9-1.42,4.36-2.85,5.78-1.54,1.53-4.03,1.17-5.92,1.1-3.78-.13-17.45-.48-15.21-7.54l13.68-43.25c2.48-7.83,4.99-15.21,8.23-22.69,1.07-2.48,3.32-3.8,6.03-4.15,5.31-.7,16.29-1.53,19.6,3.49,2.14,3.25,3.45,6.51,4.94,10.15l21.84,53.61c.36,3.34-.9,5.8-4,6.66-3.59.99-16.56,4.08-18.59.08-1.83-3.59-2.78-6.83-3.97-10.87l-10.17.19ZM707.38,437.28l13.48-.69-7.59-22.21-2.53,9.38c-1.22,4.53-2.62,8.52-3.35,13.52ZM704.49,423.84l-1.08-.97c-.24-.22-.83.79-.86,1.15l1.94-.18ZM687.81,457.54c-.43-1.24-.55-1.73-.77-1.58-.34.22-1.17.77-.84.56l1.62,1.02ZM692.91,458.9l-1.09-2.73c-.79,1.09-.32,2.3,1.09,2.73ZM694.1,456.63l-.6.36,1.24,2.06.6-.36-1.24-2.06Z"/>
  <path class="cls-5" d="M571.99,451.41l-15.47.52-6.63.37-1.86,7.95c-.3,1.3-1.59,3.29-2.56,4.47-1.24,1.51-3.87,1.25-5.68,1.19-4.02-.14-17.64-.58-15.58-7.5,6.54-22.05,13.6-43.65,21.54-65.2,1.04-2.82,3.11-4.31,5.99-4.79,4.62-.76,9.56-.86,14.11-.09,3.86.66,6.21,2.96,7.67,6.32l4.37,10.06,19.47,47.88c.74,1.83,1.55,3.68,1.06,5.64-.58,2.35-2.8,3.65-4.97,4.23-4.28,1.14-8.47,1.74-12.93,1.74-2.73,0-4.85-1.69-5.68-4.19l-2.85-8.62ZM554.66,398.11l-.96,1.73,1.19.66.96-1.73-1.19-.66ZM559.69,400.41c-1.36-.23-2.36-.09-2.87,1.01l2.87-1.01ZM565.4,402l1.01-1.94c-1.13.51-1.49,1.39-1.01,1.94ZM567.44,405.05c-.7-1.06-1.17-1.3-1.93-1.12.55.43,1.42.93,1.93,1.12ZM562.88,405.03c.13.32.85.77,1.15.95.22.13.13-.91.17-1.16s-1.42-.02-1.32.21ZM549.1,407.79l-.49-1.76c-.27.55-.81,1.3-.51,1.4.34.12,1.18.42,1,.35ZM573.31,413.4c.22.03.6-1.42.27-1.52s-1.11-.28-1.28-.3l1.01,1.82ZM567.01,436.73l-1.64-4.82-5.87-17.76-2.38,8.69c-1.28,4.69-2.61,8.92-3.55,14.14,4.83.34,8.88.18,13.43-.26ZM576.24,417.4c.56-.14,1.12-.28,1.12-.28-.46-.4-1.38-1.01-1.58-.71l-.89,1.32,1.34-.34ZM544.36,424l-.76.82c-.13.14.23.53.42.48s.48-.27.45-.46l-.11-.84ZM549.76,439.12l-1.87.07c.45.46.95,1,1.1.82l.77-.9ZM557.08,444.12l-1.36-.88c-.21-.14.2.9.32,1.12s1.03-.11,1.03-.25Z"/>
  <path class="cls-12" d="M296.65,462.57c-1.36-1.28-1.45-4.12-1.44-5.93l.13-25.27.27-21.06-13.44-.29c-1.68-.04-4.13-1.95-4.41-3.64-.59-3.7-.77-7.42-.03-11.02.53-2.6,3.66-3.74,6.08-3.87l20.01-1.07c9.46-.5,18.59-1.43,28.05-1.26,3.04.05,5.43,2.2,5.36,5.24l-.2,8.49c-.19,7.86-11.53,5.77-17.19,6.51-.09,16.65-.85,32.69-2.22,49.05-.2,2.36.07,4.91-2.3,6.29-3.52,2.04-14.05,2.19-18.68-2.17ZM304.31,406.5c-.94-.33-1.73-.59-1.83-.36l-.38.84c1.34-.12,2.29-.28,2.21-.48ZM307.48,408.87l-1.74-.5.52,1.72,1.22-1.23Z"/>
  <path class="cls-9" d="M155.03,319.55c-2.47.83-10.57,2.33-11.79-2.02l-2.61-9.28c-1.79-6.37-3.53-12.5-4.83-19.03-.52-2.61,1.12-5.26,3.83-5.71l12.02-2c2-.33,4.29,1.24,4.62,3.28.87,5.37.82,10.67,1.1,16.11l.62,12.45c.12,2.37-.37,5.34-2.96,6.21ZM142.49,290.6l-.73.44,1,1.66.73-.44-1-1.66ZM148.92,293.77l.2-.65c.04-.14-.37-.3-.5-.23l-.9.42c-.28.13-.42.91-.19,1.08s.99.67,1.08.41l.32-1.03ZM149.15,301.37c.09.34.28.8.55.78s.87-.11.8-.29l-.25-.66c-.07-.19-1.16-.02-1.11.17Z"/>
  <path class="cls-9" d="M124.44,339.13c-1.4,1.84-5.34,6.14-7.98,3.97l-11.95-9.79c-2.64-2.17-9.87-7.18-6.26-10.83l6.16-6.23c.8-.81,3.28-1.6,4.17-.87,2.52,2.08,4.28,4.33,6.16,6.8l8.62,11.29c1.22,1.6,2.7,3.56,1.09,5.66ZM106.6,327.15l.94.07c.19.02.11-.72-.04-.86s-.66-.26-.84-.19c-.22.08-.86.55-.82.77.03.15.14.58.2.8.04.15.41-.61.56-.6ZM118.15,335.56l-1.6-.1c-.13,0-.07.29,0,.54l.65,1.08c.13.22.76.12.92.07-.37-.47-.76-.82-.63-.96l.65-.63Z"/>
  <path class="cls-9" d="M188.2,332.75c-2.62,4.09-6.96.75-9.82-1.53-.67-.54-.58-2.67-.31-3.56,2.28-7.45,4.88-14.46,7.88-21.59.78-1.86,3.17-2.52,4.9-1.72l7.78,3.6c.88.41,2.09,1.41,2.26,2.19s.06,2.72-.42,3.47l-12.27,19.16Z"/>
  <ellipse class="cls-9" cx="152.72" cy="333.41" rx="8.57" ry="8.56"/>
  <path class="cls-9" d="M133.85,353.69c-2.79,2.43-6.25,1.94-8.74-.17s-2.78-6.26-.67-8.95c2.58-3.28,7.03-3.62,9.84-1,3.01,2.8,2.82,7.28-.44,10.12Z"/>
  <path class="cls-2" d="M675.91,378.56c-2.92.58-5.79.41-8.74.26v-15.22c5.8-.39,13.42-.62,14.32,6.57.47,3.7-1.38,7.55-5.59,8.39ZM676.13,375.05c1.62-.9,1.98-2.93,1.84-4.48-.3-3.56-3.99-4.3-7.26-3.87l.09,9.18c1.87.07,3.69.07,5.32-.84Z"/>
  <ellipse class="cls-9" cx="176.39" cy="342.32" rx="6.66" ry="6.65"/>
  <path class="cls-6" d="M717.88,378.6c-6.79,2.59-4.35-6.31-9.67-4.34l-.17,4.21c-.58.65-2.77.64-3.5.05l-.03-14.99,7.42-.03c1.26,0,3.35.65,4.16,1.59,2.34,2.74,1.41,6.44-1.32,8.43l3.11,5.08ZM712.09,370.93c.65,0,1.72-1.21,1.82-1.84s-.52-2.17-1.21-2.24c-1.58-.16-3.25-.18-4.65-.16l.02,4.29,4.02-.04Z"/>
  <path class="cls-8" d="M637.58,378.81c-7.29,2.01-4.02-6.31-9.58-4.63l-.33,4.31c-.25.76-2.81.67-3.34,0l.04-14.94,6.96-.02c1.19,0,3.48.54,4.31,1.36,2.62,2.61,1.86,6.74-1.17,8.59l3.11,5.34ZM632.59,370.57c1.74-.75,1.2-2.67.33-3.77l-5.09-.19.11,4.29c1.46.09,3.34.23,4.64-.33Z"/>
  <path class="cls-1" d="M694.4,378.91c-5.23,1-9.53-2.21-9.92-7.01-.38-4.71,3.32-8.75,8.37-8.61,4.19.12,7.41,3.03,7.92,7.05.49,3.84-2.02,7.73-6.37,8.56ZM697.34,371.23c0-2.61-2.11-4.72-4.72-4.72s-4.72,2.11-4.72,4.72,2.11,4.72,4.72,4.72,4.72-2.11,4.72-4.72Z"/>
  <path class="cls-7" d="M659.32,375.72l-6.55.05-1.44,2.97c-.67.32-2.19.23-3.5-.06l6.33-14.97c1.11-.2,2.59-.23,3.62-.09l6.59,15.06c-1.09.3-2.71.32-3.72.07l-1.32-3.03ZM657.87,372.53l-1.87-4.36c-1.04,1.9-1.49,2.91-2,4.39l3.87-.03Z"/>
  <polygon class="cls-6" points="731.9 372.58 725.2 372.7 725.18 375.89 733.01 375.98 733.09 378.94 721.6 378.88 721.63 363.52 732.69 363.53 732.73 366.61 725.18 366.68 725.15 369.65 731.82 369.83 731.9 372.58"/>
  <path class="cls-6" d="M745.65,378.6c-3.07,1.05-6.85.57-9.26-1.82-.6-.59,1.23-2.61,2.04-2.35,1.74,1.2,5.74,2.77,6.5.51.16-.48-.6-1.53-1.09-1.68l-4.89-1.47c-1.46-.44-2.39-2.24-2.38-3.52,0-1.57.73-3.34,2.27-4.13,2.89-1.49,6.52-1.08,8.99,1.02-.04.81-1.08,2.25-1.75,2.35-1.87-1.26-5.51-1.93-5.98-.08-.09.36.5,1.27.89,1.4l3.93,1.29c1.97.65,3.37,1.81,3.57,3.7s-.58,4-2.84,4.77Z"/>
  <path class="cls-3" d="M618.41,374.08c.81.22,1.96,1.25,2.49,2.1-1.71,2.13-4.23,3.02-6.87,2.89-4.58-.23-7.77-3.81-7.64-8.07.13-4.29,3.49-7.64,8.09-7.67,2.53-.02,4.72.81,6.31,2.74-.64.88-1.65,1.82-2.45,1.96-2.1-1.74-4.98-2.1-6.82-.41s-2.04,4.98-.22,6.89,4.75,1.94,7.1-.43Z"/>
  <path class="cls-7" d="M644.89,378.4c0,.83-2.97.83-3.4.07l-.06-14.63c1.05-.28,2.14-.3,3.5-.19l-.04,14.75Z"/>
  <path class="cls-4" d="M122.69,499.06c-2.42.12-4.92-.06-7.13-.48l-5.87-1.12-13.15,15.44c-1.05,1.23-3.13,1.6-4.34.71s-1.26-2.94-.13-4.34l8.84-10.97c1.33-1.65,2.92-3.76,3.41-5.69-7.99-16.34-14.5-55.94-14.47-72.95l.02-11.86c.01-6.57.19-12.98,1.66-19.35,1.88-8.12,8.42-10.22,15.6-11.59,30.94-5.91,62.07-9.69,93.57-10.61,2.38-.07,4.23.95,6.86.25,3.6-.97,7.84-.42,11.76-.43-.77,2.43-1.6,4.81-.22,6.95,1.51,2.34,4.71,3.8,7.44,3.48l4.47-.53c6.37,16.73,9.91,35.09,11.88,52.79,1.42,12.7,1.76,25.12,1.37,37.89-.14,4.82-1,9.44-3.78,13.36-1.55,2.18-4.33,3.71-6.89,4.66-12.13,4.49-53,10.02-67.52,11.62-14.59,1.6-28.78,2.07-43.4,2.78ZM204.32,436.25c13.06-7.07,20.66-.15,20.91-5.12.06-1.09-.92-2.29-2.05-2.5l-5.04-.92c4.93-10.63.55-22.16-9.84-27.33-7.23-3.6-15.9-2.19-21.99,2.96s-8.42,13.18-6.43,21.14c1.67,6.71,7.21,11.44,13.8,13.79l-1.41,3.56c-.23.59.64,2.2,1.27,2.2,2.55-.01,4.63-4.45,10.78-7.78ZM146.97,449.1c.19-.45.26-1.65-.02-2.07l-2.27-3.45c6.03-3.85,9.53-9.85,9.65-16.51.19-10.51-7.78-19.71-18.53-20.78-12.2-1.22-22.2,7.84-22.54,20.1-.13,4.9,1.41,9.45,4.59,13.56l-5.13,2.75c-.76.41-.89,2.59-.32,3.14.5.48,2.1.75,2.82.44,19.42-8.23,30.2,6.53,31.74,2.83ZM162.31,481.85l25.95-3.39c1.75-.23,3.71-1.36,3.56-3.44-.43-6.08-1.09-12.22-2.64-18.17-1.77-6.81-7.18-11.53-14.11-12.24-5.55-.57-11.18,1.52-14.91,5.69s-4.93,10.02-4.27,15.55l1.4,11.71c.14,1.2.54,2.59,1.24,3.28.73.73,2.35,1.2,3.79,1.01Z"/>
  <path class="cls-4" d="M223.4,372.6c-1.67-1.33,1.78-2.68,2.04-4.5-1.07-.02-1.95.29-2.61.7l-.76.48c-.12.08-.36-.04-.34-.16.03-.2.19-.81.35-1.05,4.49-6.68,12.07-8.01,12.03-10.18,0-.44-1.45-.89-1.89-.7l-7.48,3.15c-3.67-.95-6.71-1.44-10.23-1.66l1.08-2.32c.26-.56-.46-1.99-1.15-2.29-2.43,1.07-3.64,7.12-7.5,8.22.51-1.18,1.73-3.35-.18-3.59-1.8.81-1.31,4.28-2.85,4.48-.42.05-.97-1.03-.87-1.5l.89-4c-1.22.55-1.57,1.17-2.81,2.4.86-7.39,7.99-13.48,13.92-17.79l3.65,2.42c.67.44,2.25.44,2.79-.2l-6.33-6.82c-2.56-2.76-4.06-5.81-5.06-9.57-.47-1.75,3.3-1.62,2.32-2.37l-1.04-.79c-.45-.34-1.08-.95-1.08-1.4,0-.78.77-1.02,1.65-.86.38.07,1.29.14,1.26-.15s-.19-1-.36-1.24l-1.32-1.75c1.29-2.36,2.89-4.88,4.91-6.64,1.4-1.21,3.26-2.2,4-3.84,1.44-3.19,6.87-14.02,10.72-13.72,2.18,2.79,3.71,6.37,4.4,9.59-4.43,3.33,5.88,1.11,14.16,7.64,1.01.79,2.57,1.73,3.74,1.8,4.56-2.65,9.15-4.48,14.29-5.01,1.4,7.44-1.72,13.84-4.38,20.49-1.28,3.21.5,7.49-2.26,10.41l-4.33-1.28c-.29-.08-1.18.21-1.43.35-.34.18.17,1.35.55,1.53l3.72,1.8c.26.77-1.4,2.79-2.25,2.52l-3.15-2.64c-.26-.22-1.37-.21-1.43.11s.05,1.07.24,1.36l2.13,3.18c-4.54,3.45-11.14,1.85-13.73,4.02-.31.26.56,1.28,1.02,1.38,2.91.64,6.05.5,9.24.04,4.33,9.4,9.21,21.47,6.29,31.59-1.86,6.47-6.33,11.61-12.71,13.17-2.11-8.5-4.38-16.44-7.51-24.47,2.02-1.29,4.92-3.47,6.34-5.13.28-.33-.41-1.66-.77-1.61s-1.33.14-1.72.43c-4.03,3.04-9.1,5.89-14.29,6.56l.9-1.31c.21-.3.23-1.4-.13-1.49-1.99-.29-3.16,3.43-4.69,2.2ZM231.79,305.72l-1.38-6.66c-.93-4.51-7.43,7.54-6.65,8.41,3.07-.3,5.2-.78,8.03-1.75ZM217.24,321.12c1.45,3.15,4.77,4.53,7.62,3.68s4.88-3.61,4.72-6.72c-.14-2.82-2.22-5.36-5.38-5.99-2.23-.44-4.77.85-5.98,2.49-1.32,1.79-1.96,4.41-.98,6.54ZM262.14,325.15c3.05-4.18,3.91-7.94,3.82-12.57-3.56.42-6.38,2.08-8.91,4.56l5.09,8.01ZM251.08,325.08c-1.55-3.02-5.15-4.44-8.27-3.6-4.04,1.09-5.92,5.49-4.37,9.2,1.45,3.47,5.67,5.58,9.21,3.82,3.34-1.67,5.4-5.59,3.44-9.42ZM231.9,335.75c.06-1.93-2.84-4.76-.58-6.06.72-.41,2.46-1.36,2.23-2.11-.63-1.94-3.41-2.97-5.15-2.2-.34.82-.01,2.52.06,3.8-.75,1.65-2.58.81-4.54,2.35-.22.17.54,1.19.81,1.28.96.31,3.02-.24,3.7-.81.31,3.34,3.44,4.87,3.47,3.76Z"/>
  <path class="cls-4" d="M260.49,388.56c.39-1.65.86-3.08,1.45-4.37,8.25-2.49,11.58-10.25,10.94-18.29-.37-4.6.27-8.78,2.34-12.97.24-.49,1.16-1.31,1.69-1.33s1.56.63,1.89,1.09l3.74,5.24c-2.79,2.85-4.05,6.16-4.32,10.07-.8,11.2-5.99,19.17-17.73,20.56Z"/>
  <path class="cls-4" d="M81.1,467.55c-1.26.39-2.03.78-3.22,1.73-.01-1.1,1.66-3.05,3.22-1.73Z"/>
  <path class="cls-4" d="M94.53,486.19c-.36.99-1.59,1.44-2.41.13l2.41-.13Z"/>
  <path class="cls-4" d="M112.74,515.14l-.2,1.42c-.03.25-.57.21-.84.1-.24-.1-.14-.86.06-1.01l.72-.54c.13-.1,1.09.21.26.03Z"/>
  <path class="cls-4" d="M74.48,425.25c-.75-.45-1.54-1.07-1.02-.87l1.53.06c.2,0-.33.92-.51.81Z"/>
  <path class="cls-4" d="M176.87,364.58c-.34-.47-.7-.98-.83-1.29s.47-.82.93-1.23l-.1,2.52Z"/>
  <path class="cls-4" d="M83.08,396.84c.24.2-.16-.13-.61-.5-.13-.11-.56-.5-.57-.5-.02,0,.57-.43.73-.56.14-.11.19.33.44,1.56Z"/>
  <path class="cls-4" d="M84.17,457.91l-1.11,1.5c-.12.17-.42-.76-.51-.95s-.02-.15.63-.77l1,.22Z"/>
  <path class="cls-4" d="M80.95,464.3c-.92-.14-1.06-.19-.23-.17.51-.51.77-.82.88-.69l.69.78c.16.18-1.13.11-1.34.08Z"/>
  <path class="cls-4" d="M78.61,421.95l-.79-1.27c-.16-.26.5-.85.85-1.12l-.06,2.39Z"/>
  <path class="cls-4" d="M85.74,473.52l-.79-1.97c.79.29,1.15.42,1.08.7l-.29,1.27Z"/>
  <path class="cls-4" d="M75.79,450.27l-.6-.7c1.02-.39,1.19-.54,1.38-.39s.41.88.17.92l-.95.17Z"/>
  <path class="cls-4" d="M87.91,487.54c-.05.15-1.01.5-1.08.26s-.36-1.17-.35-1.15l1.43.9Z"/>
  <path class="cls-4" d="M82.3,418.35l-2.05-1.05c.91-.4,1.76.12,2.05,1.05Z"/>
  <path class="cls-4" d="M187.04,499.76c-.01-.17.86-.02.85.15l-.03.89c0,.18-.74.43-.75.26l-.08-1.3Z"/>
  <path class="cls-4" d="M440.19,443.68c-.29.62-1.53.09-1.98-.81.49-.23,1.23.09,1.98.81Z"/>
  <path class="cls-11" d="M490.22,417.14v-.77c.75,0,1.18,0,1.18-.03,0-.07.06.48.08.66s-.37.14-1.26.14Z"/>
  <path class="cls-4" d="M438.7,426.8l-1.75-1.58c.8-.39,1.78.56,1.75,1.58Z"/>
  <path class="cls-11" d="M478.76,429.01l-2.2-.69c.66-.97,1.68-.42,2.2.69Z"/>
  <path class="cls-11" d="M497.81,401.47c-.01.06-.22-.46-.13-.6l.61-1c-.25-.37.37.55.53.78s-.38.43-1.01.82Z"/>
  <path class="cls-11" d="M494.62,395.37c-.1-.12.92-.08,1.02-.21.15-.19.14.69.15,1.09,0,.15-.25.23-.36.1l-.82-.99Z"/>
  <path class="cls-4" d="M388.37,441.61c-4.93,4.3-14.04,4.55-18.9,1.08-5.82-4.15-7.51-11.15-6.51-17.94s5.68-13.11,12.97-14.34c3.73-.63,8.03.34,11.08,2.51,8.61,6.12,9.16,21.88,1.36,28.68Z"/>
  <path class="cls-4" d="M642.57,441.94c-3.76,1.1-7.52,1.38-11.31,1.6-.57.03-1.77-1.22-1.76-1.8l.57-30.22c5.51-1.27,11.01-.14,16.01,2.55,3.11,1.67,5.48,4.88,6.8,8.23,3.24,8.24-1.67,17.11-10.31,19.63Z"/>
  <path class="cls-4" d="M661.7,408.06c-1.27.54-1.96-.02-2.31-1.26l2.31,1.26Z"/>
  <path class="cls-4" d="M621.68,458.54c-.54-.47-1.08-.93-.9-1.09l.89-.8v1.89Z"/>
  <path class="cls-4" d="M656.22,405.03c.07-.22.93.18,1.15.18s-.32.54-.45.74c-.27.41-.82-.57-.7-.92Z"/>
  <path class="cls-4" d="M707.38,437.28c.73-4.99,2.13-8.98,3.35-13.52l2.53-9.38,7.59,22.21-13.48.69Z"/>
  <path class="cls-4" d="M704.49,423.84l-1.94.18c.02-.37.62-1.37.86-1.15l1.08.97Z"/>
  <path class="cls-4" d="M692.91,458.9c-1.4-.44-1.88-1.64-1.09-2.73l1.09,2.73Z"/>
  <path class="cls-4" d="M687.81,457.54l-1.62-1.02c-.32.21.5-.33.84-.56.22-.15.34.34.77,1.58Z"/>
  <rect class="cls-4" x="694.07" y="456.64" width=".7" height="2.41" transform="translate(-136.61 422.91) rotate(-30.99)"/>
  <path class="cls-4" d="M567.01,436.73c-4.55.44-8.6.6-13.43.26.94-5.23,2.27-9.45,3.55-14.14l2.38-8.69,5.87,17.76,1.64,4.82Z"/>
  <rect class="cls-4" x="553.78" y="398.63" width="1.98" height="1.36" transform="translate(-63.73 690.29) rotate(-60.94)"/>
  <path class="cls-4" d="M576.24,417.4l-1.34.34.89-1.32c.2-.3,1.12.31,1.58.71,0,0-.56.14-1.12.28Z"/>
  <path class="cls-4" d="M544.36,424l.11.84c.03.19-.26.42-.45.46s-.55-.34-.42-.48l.76-.82Z"/>
  <path class="cls-4" d="M559.69,400.41l-2.87,1.01c.51-1.1,1.51-1.23,2.87-1.01Z"/>
  <path class="cls-4" d="M573.31,413.4l-1.01-1.82c.17.02.94.2,1.28.3s-.05,1.55-.27,1.52Z"/>
  <path class="cls-4" d="M562.88,405.03c-.1-.24,1.36-.47,1.32-.21s.05,1.29-.17,1.16c-.3-.18-1.01-.63-1.15-.95Z"/>
  <path class="cls-4" d="M567.44,405.05c-.51-.19-1.38-.7-1.93-1.12.76-.18,1.22.06,1.93,1.12Z"/>
  <path class="cls-4" d="M549.76,439.12l-.77.9c-.16.18-.65-.36-1.1-.82l1.87-.07Z"/>
  <path class="cls-4" d="M557.08,444.12c0,.14-.91.47-1.03.25s-.53-1.26-.32-1.12l1.36.88Z"/>
  <path class="cls-4" d="M565.4,402c-.49-.54-.12-1.42,1.01-1.94l-1.01,1.94Z"/>
  <path class="cls-4" d="M549.1,407.79c.18.07-.66-.23-1-.35-.3-.11.24-.86.51-1.4l.49,1.76Z"/>
  <path class="cls-4" d="M304.31,406.5c.08.2-.87.36-2.21.48l.38-.84c.1-.22.89.03,1.83.36Z"/>
  <polygon class="cls-4" points="307.48 408.87 306.26 410.1 305.74 408.37 307.48 408.87"/>
  <path class="cls-4" d="M148.92,293.77l-.32,1.03c-.08.27-.85-.24-1.08-.41s-.09-.95.19-1.08l.9-.42c.14-.06.55.09.5.23l-.2.65Z"/>
  <path class="cls-4" d="M149.15,301.37c-.05-.19,1.04-.36,1.11-.17l.25.66c.07.18-.54.27-.8.29s-.46-.44-.55-.78Z"/>
  <rect class="cls-4" x="142.19" y="290.68" width=".85" height="1.94" transform="translate(-129.81 115.07) rotate(-30.99)"/>
  <path class="cls-4" d="M106.6,327.15c-.15-.01-.52.75-.56.6-.06-.21-.17-.65-.2-.8-.04-.23.6-.69.82-.77.18-.07.7.06.84.19s.23.87.04.86l-.94-.07Z"/>
  <path class="cls-4" d="M712.09,370.93l-4.02.04-.02-4.29c1.4-.02,3.07,0,4.65.16.69.07,1.31,1.61,1.21,2.24s-1.17,1.84-1.82,1.84Z"/>
  <path class="cls-4" d="M632.59,370.57c-1.3.56-3.18.43-4.64.33l-.11-4.29,5.09.19c.87,1.1,1.41,3.02-.33,3.77Z"/>
  <ellipse class="cls-4" cx="692.62" cy="371.23" rx="4.72" ry="4.72"/>
  <path class="cls-4" d="M657.87,372.53l-3.87.03c.51-1.48.96-2.48,2-4.39l1.87,4.36Z"/>
  <path class="cls-12" d="M146.97,449.1c-1.55,3.71-12.32-11.05-31.74-2.83-.72.31-2.32.03-2.82-.44-.57-.54-.44-2.73.32-3.14l5.13-2.75c-3.17-4.11-4.72-8.65-4.59-13.56.34-12.26,10.34-21.32,22.54-20.1,10.75,1.08,18.72,10.27,18.53,20.78-.12,6.66-3.61,12.66-9.65,16.51l2.27,3.45c.28.42.2,1.62.02,2.07ZM138.89,440.21c1.88.26,4.35-1.71,5.62-3.19-3.58,1.27-7.33,1.22-10.72-.89-2.9-1.8-4.67-4.59-5.51-8.27-1.52-6.72,1.8-12.64,8.78-15.39-4.81-1.53-10.66.12-14.02,3.69-4.17,4.45-5.18,10-3.31,15.52.82,2.43,2.07,5.87,4.77,6.57,4.95-.26,9.32.4,14.38,1.95Z"/>
  <path class="cls-12" d="M204.32,436.25c-6.15,3.33-8.23,7.77-10.78,7.78-.63,0-1.5-1.61-1.27-2.2l1.41-3.56c-6.59-2.36-12.13-7.09-13.8-13.79-1.99-7.97.4-16.04,6.43-21.14s14.76-6.56,21.99-2.96c10.39,5.17,14.77,16.7,9.84,27.33l5.04.92c1.14.21,2.11,1.41,2.05,2.5-.26,4.98-7.85-1.94-20.91,5.12ZM198.54,433.24l5.37-3.37c-5.91-1.74-9.88-6.66-10.07-12.36-.2-5.99,3.51-11.04,9.54-13.03-4-1.13-8.37-.42-12.07,2.03-7.09,4.71-8.75,14.93-3.48,21.7,2.51,3.23,6.66,5.23,10.71,5.03Z"/>
  <path class="cls-12" d="M162.31,481.85c-1.45.19-3.06-.28-3.79-1.01s-1.09-2.07-1.24-3.28l-1.4-11.71c-.66-5.53.47-11.3,4.27-15.55s9.37-6.26,14.91-5.69c6.93.72,12.34,5.43,14.11,12.24,1.55,5.94,2.21,12.08,2.64,18.17.15,2.08-1.82,3.21-3.56,3.44l-25.95,3.39ZM162.57,472.09c-.22,1.8-.11,3.63.92,4.38,7.7-.67,14.9-1.51,22.49-3.15-.39-5.35-.76-10.36-2.08-15.35s-5.66-8.92-10.86-7.76c3.12,3.09,5.38,5.97,6.02,9.94l1.2,7.51c.14.88-.84,2.31-1.82,2.43l-15.86,2.01Z"/>
  <path class="cls-9" d="M251.08,325.08c1.96,3.83-.1,7.76-3.44,9.42-3.53,1.77-7.75-.35-9.21-3.82-1.55-3.71.34-8.11,4.37-9.2,3.13-.85,6.73.58,8.27,3.6ZM239.98,328.93c.29,2.77,2.85,4.13,5.17,4.15s4.06-1.6,4.57-3.81-.4-4.54-2.49-5.46c.52,2.71-.02,4.48-2.08,5.83-1.31.86-3.13.37-5.17-.7Z"/>
  <path class="cls-9" d="M217.24,321.12c-.98-2.13-.35-4.75.98-6.54,1.21-1.63,3.75-2.93,5.98-2.49,3.16.63,5.24,3.17,5.38,5.99.16,3.11-1.77,5.84-4.72,6.72s-6.17-.53-7.62-3.68ZM227.66,318.89c.24-1.51-.32-3.18-1.37-3.46-.33,2.04-.96,3.85-2.25,4.45-1.75.81-3.65.56-5.24-.61.14,2.09,2.06,3.81,4.2,3.88,2.35.07,4.22-1.44,4.67-4.26Z"/>
  <path class="cls-9" d="M262.14,325.15l-5.09-8.01c2.53-2.48,5.35-4.14,8.91-4.56.09,4.62-.76,8.39-3.82,12.57Z"/>
  <path class="cls-9" d="M231.79,305.72c-2.84.97-4.97,1.45-8.03,1.75-.78-.86,5.72-12.91,6.65-8.41l1.38,6.66Z"/>
  <path class="cls-9" d="M231.9,335.75c-.04,1.11-3.16-.42-3.47-3.76-.68.57-2.74,1.12-3.7.81-.28-.09-1.03-1.1-.81-1.28,1.96-1.55,3.79-.71,4.54-2.35-.07-1.28-.39-2.98-.06-3.8,1.74-.77,4.52.26,5.15,2.2.23.75-1.51,1.7-2.23,2.11-2.26,1.3.65,4.13.58,6.06Z"/>
  <path class="cls-4" d="M138.89,440.21c-5.05-1.54-9.43-2.2-14.38-1.95-2.7-.71-3.95-4.15-4.77-6.57-1.87-5.52-.87-11.07,3.31-15.52,3.35-3.58,9.2-5.23,14.02-3.69-6.98,2.76-10.3,8.68-8.78,15.39.83,3.68,2.61,6.47,5.51,8.27,3.39,2.1,7.14,2.16,10.72.89-1.27,1.48-3.75,3.44-5.62,3.19Z"/>
  <path class="cls-4" d="M198.54,433.24c-4.04.2-8.2-1.8-10.71-5.03-5.27-6.77-3.61-16.99,3.48-21.7,3.69-2.45,8.06-3.16,12.07-2.03-6.03,1.98-9.74,7.03-9.54,13.03s4.16,10.62,10.07,12.36l-5.37,3.37Z"/>
  <path class="cls-4" d="M162.57,472.09l15.86-2.01c.98-.12,1.96-1.56,1.82-2.43l-1.2-7.51c-.63-3.97-2.89-6.85-6.02-9.94,5.2-1.16,9.55,2.82,10.86,7.76s1.69,10,2.08,15.35c-7.59,1.64-14.79,2.49-22.49,3.15-1.03-.75-1.14-2.58-.92-4.38Z"/>
  <path class="cls-4" d="M239.98,328.93c2.04,1.07,3.87,1.56,5.17.7,2.05-1.35,2.59-3.11,2.08-5.83,2.08.92,2.99,3.25,2.49,5.46s-2.31,3.83-4.57,3.81-4.88-1.38-5.17-4.15Z"/>
  <path class="cls-4" d="M227.66,318.89c-.45,2.82-2.32,4.33-4.67,4.26-2.14-.07-4.06-1.78-4.2-3.88,1.59,1.17,3.49,1.41,5.24.61,1.29-.59,1.93-2.41,2.25-4.45,1.05.28,1.61,1.95,1.37,3.46Z"/>
</svg>
    `;
  },
  async init() {
    // Check if we have token and user in query params (Google login callback for Capacitor/APK)
    const urlParams = new URLSearchParams(window.location.search);
    const qToken = urlParams.get('token');
    const qUser = urlParams.get('user');
    
    // Save return_to if present on Vercel domain
    const platform = urlParams.get('platform');
    const returnTo = urlParams.get('return_to');
    if (platform === 'capacitor' && returnTo) {
      sessionStorage.setItem('capacitor_return_to', returnTo);
    }

    if (qToken && qUser) {
      try {
        API.setToken(qToken);
        API.setUser(JSON.parse(decodeURIComponent(qUser)));
        // Clean URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error("Erro ao processar login externo do Google:", e);
      }
    }

    // If we are on Vercel and have a saved return_to, and the user is logged in, redirect back immediately
    const savedReturnTo = sessionStorage.getItem('capacitor_return_to');
    const currentUser = API.getUser();
    const currentToken = API.token;
    if (savedReturnTo && currentUser && currentToken) {
      sessionStorage.removeItem('capacitor_return_to');
      window.location.href = `${savedReturnTo}/?token=${currentToken}&user=${encodeURIComponent(JSON.stringify(currentUser))}`;
      return;
    }

    // Initialize Offline Manager (IndexedDB)
    try {
      await OfflineManager.init();
    } catch (e) {
      console.error("Erro ao inicializar OfflineManager:", e);
    }

    // Global click listener for ripple effects on buttons
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.btn, .nav-item, .segmented-item');
      if (target) {
        Components.createRipple(e, target);
      }
    });

    // Fechar sidebar mobile ao clicar fora
    document.addEventListener('click', (e) => {
      const sidebar = document.getElementById('sidebar');
      const toggleBtn = e.target.closest('.ios-menu-btn, .sidebar-toggle-btn, .toggle-sidebar');
      if (sidebar && sidebar.classList.contains('mobile-open') && !sidebar.contains(e.target) && !toggleBtn) {
        App.closeDrawer();
      }
    });

    // PWA Install Prompt Listener
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      const installBtn = document.getElementById('pwa-install-btn');
      if (installBtn) installBtn.style.display = 'flex';
    });

    window.addEventListener('appinstalled', (evt) => {
      console.log('PWA instalado com sucesso');
      window.deferredPrompt = null;
      const installBtn = document.getElementById('pwa-install-btn');
      if (installBtn) installBtn.style.display = 'none';
    });

    // Add popstate listener for back button navigation
    window.addEventListener('popstate', (event) => {
      if (event.state && event.state.route) {
        this.navigate(event.state.route, event.state.data, false);
      }
    });

    // Android Hardware Back Button listener via Capacitor App plugin
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
      window.Capacitor.Plugins.App.addListener('backButton', ({ canGoBack }) => {
        console.log('Capacitor BackButton event received. canGoBack:', canGoBack, 'currentRoute:', this.currentRoute);
        
        // Load preferences to check if option is enabled
        let backButtonVolta = true;
        const savedPref = localStorage.getItem('bancada_config_preferencias');
        if (savedPref) {
          try {
            const parsed = JSON.parse(savedPref);
            if (parsed.androidBackButtonVolta !== undefined) {
              backButtonVolta = parsed.androidBackButtonVolta;
            }
          } catch (e) {
            console.error("Erro ao ler preferência de backButton:", e);
          }
        }

        if (!backButtonVolta) {
          // If preference is disabled, do default action (exit app)
          window.Capacitor.Plugins.App.exitApp();
          return;
        }

        // If enabled, let's navigate back!
        // If we are at a root page or there's no history, exit the app
        const isRootPage = ['login', 'admin-dashboard', 'padeiro-inicio'].includes(this.currentRoute);
        if (canGoBack && !isRootPage) {
          window.history.back();
        } else {
          window.Capacitor.Plugins.App.exitApp();
        }
      });
    }

    // Check for APK updates inside Capacitor
    const isCapacitor = !!window.Capacitor || 
                        navigator.userAgent.includes('Capacitor') ||
                        window.location.origin.startsWith('capacitor://') || 
                        (window.location.origin.startsWith('http://localhost') && !window.location.port && !window.location.host.includes(':3000'));
    if (isCapacitor) {
      this.checkForApkUpdates();
    }

    const user = API.getUser();
    const token = API.token;
    if (user && token) {
      if (['admin', 'superadmin', 'criador', 'editor'].includes(user.role)) {
        const savedRoute = localStorage.getItem('currentRoute');
        const initialRoute = (savedRoute && savedRoute !== 'selecao-perfil' && savedRoute !== 'login') ? savedRoute : 'admin-dashboard';
        history.replaceState({ route: initialRoute, data: {} }, '', '');
        this.navigate(initialRoute, {}, false);
      } else {
        history.replaceState({ route: 'selecao-perfil', data: {} }, '', '');
        this.navigate('selecao-perfil', {}, false);
      }
    } else {
      history.replaceState({ route: 'login', data: {} }, '', '');
      this.navigate('login', {}, false);
    }
  },

  async checkForApkUpdates() {
    try {
      if (sessionStorage.getItem('bancada_apk_update_prompt_shown')) return;

      const res = await fetch('/api/upload/apk/latest');
      const data = await res.json();

      if (data.success && data.version) {
        const compareVersions = (v1, v2) => {
          const parts1 = v1.split('.').map(Number);
          const parts2 = v2.split('.').map(Number);
          const maxLen = Math.max(parts1.length, parts2.length);
          for (let i = 0; i < maxLen; i++) {
            const num1 = parts1[i] || 0;
            const num2 = parts2[i] || 0;
            if (num1 > num2) return 1;
            if (num1 < num2) return -1;
          }
          return 0;
        };

        if (compareVersions(data.version, App.version) > 0) {
          sessionStorage.setItem('bancada_apk_update_prompt_shown', 'true');
          
          const title = 'Atualização Disponível';
          const contentHtml = `
            <div style="text-align: center; font-family: var(--font-main);">
              <p style="color: var(--text-main); font-size: 15px; margin-bottom: 16px; line-height: 1.5;">
                Uma nova versão do aplicativo <strong>Bancada / SmartGestor</strong> está disponível (V${data.version}). Deseja atualizar agora?
              </p>
              <div style="background-color: var(--primary-light); padding: 12px; border-radius: 12px; margin-bottom: 20px; display: inline-flex; align-items: center; gap: 8px;">
                <i data-lucide="sparkles" style="color: var(--primary); width: 20px; height: 20px;"></i>
                <span style="color: var(--text-main); font-size: 13px; font-weight: 500;">Novas melhorias e correções adicionadas</span>
              </div>
            </div>`;
          
          const footerHtml = `
            <div style="display: flex; gap: 12px; width: 100%;">
              <button class="pill-btn btn-light-orange" style="flex: 1; height: 44px; font-size: 14px;" onclick="Components.closeModal()">Depois</button>
              <button class="pill-btn btn-orange" style="flex: 1; height: 44px; font-size: 14px; gap: 8px;" onclick="window.open('${data.downloadUrl}', '_system'); Components.closeModal();">
                <i data-lucide="download" class="btn-icon"></i> Atualizar
              </button>
            </div>`;

          setTimeout(() => {
            if (typeof Components !== 'undefined') {
              Components.showModal(title, contentHtml, footerHtml);
              Components.renderIcons();
            }
          }, 3000);
        }
      }
    } catch (e) {
      console.warn("Erro ao buscar atualizações do APK:", e);
    }
  },

  navigate(route, data = {}, pushToHistory = true) {
    const pageContainer = document.getElementById('page-container');
    const user = API.getUser();
    
    if (pageContainer && this.currentRoute !== 'login' && route !== 'login' && user) {
      pageContainer.classList.add('page-exit-active');
      setTimeout(() => {
        this.executeNavigation(route, data, pushToHistory);
      }, 180);
    } else {
      this.executeNavigation(route, data, pushToHistory);
    }
  },

  executeNavigation(route, data = {}, pushToHistory = true) {
    // Prevent scale/layout bugs when switching tabs by cleaning route classes
    const classesToRemove = [
      'dashboard-page-active',
      'tf-page-active',
      'clientes-page-active',
      'metas-page-active',
      'orcamentos-page-active',
      'dc-page-active',
      'kanban-redesign-active',
      'cal-page-active'
    ];
    document.body.classList.remove(...classesToRemove);
    const pageContainer = document.getElementById('page-container');
    if (pageContainer) {
      pageContainer.classList.remove(...classesToRemove);
      pageContainer.style.removeProperty('padding');
      pageContainer.style.removeProperty('margin');
      pageContainer.style.removeProperty('width');
      pageContainer.style.removeProperty('max-width');
      pageContainer.style.removeProperty('display');
      pageContainer.style.removeProperty('position');
      pageContainer.style.removeProperty('height');
      pageContainer.style.removeProperty('overflow');
    }

    this.currentRoute = route;
    this.routeData = data;
    localStorage.setItem('currentRoute', route);
    
    if (pushToHistory) {
      if (!history.state || history.state.route !== route) {
        history.pushState({ route, data }, '', '');
      }
    }
    const app = document.getElementById('app');
    if (!app) {
      console.error('❌ Elemento #app não encontrado no DOM!');
      return;
    }

    if (route === 'login') {
      const user = API.getUser();
      if (user && API.token) {
        const isManagement = ['superadmin', 'admin', 'criador', 'editor'].includes(user.role);
        this.navigate(isManagement ? 'admin-dashboard' : 'selecao-perfil');
        return;
      }
      app.innerHTML = Auth.renderLogin();
      Auth.initGoogleLogin();
      Auth.checkApkDownloadModal();
      return;
    }

    if (route === 'selecao-perfil') {
      const user = API.getUser();
      const token = API.token;
      if (!user || !token) {
        this.navigate('login');
        return;
      }
      app.innerHTML = this.renderRoleSelectionPage(user, token);
      return;
    }

    if (route === 'primeiro-acesso') {
      app.innerHTML = Auth.renderSetPassword();
      return;
    }

    const user = API.getUser();
    if (!user) { this.navigate('login'); return; }

    const isManagement = ['superadmin', 'admin', 'criador', 'editor'].includes(user.role);

    if (!isManagement) {
      this.navigate('selecao-perfil');
      return;
    }

    // Build layout if needed
    const isCreator = user && user.role === 'criador';
    const existingLayout = document.querySelector('.app-layout');
    if (!existingLayout) {
      app.innerHTML = `
      <div class="app-layout ${isCreator ? 'creator-layout' : ''}">
        ${this.renderSidebar(user)}
        <div class="main-content">
          <div id="header-wrapper">
            ${isCreator ? '' : this.renderHeader(route)}
          </div>
          <div class="page-content" id="page-container">${Components.loading()}</div>
        </div>
        ${this.renderBottomNavbar(user)}
      </div>`;
    } else {
      const headerWrapper = document.getElementById('header-wrapper');
      if (headerWrapper) {
        headerWrapper.innerHTML = isCreator ? '' : this.renderHeader(route);
      }
      document.getElementById('page-container').innerHTML = Components.loading();
    }

    // Highlight active nav
    const activeRouteMap = {
      'cronograma': 'admin-dashboard',
      'financeiro': 'admin-dashboard',
      'orcamentos': 'admin-dashboard',
      'metas': 'admin-dashboard',
      'relatorios': 'admin-dashboard',
      'dev': 'configuracoes',
      'descobrir-canais': 'clientes'
    };
    const highlightRoute = activeRouteMap[route] || route;

    document.querySelectorAll('.nav-item').forEach(item => {
      const isBottomNavItem = item.classList.contains('bottom-nav-item');
      item.classList.toggle('active', item.dataset.route === (isBottomNavItem ? highlightRoute : route));
    });

    // Fechar sidebar no mobile após navegação
    if (window.innerWidth < 1024) {
      this.closeDrawer();
    }

    // Update nav indicator (if exists)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const indicator = document.getElementById('nav-indicator');
        const activeItem = document.querySelector(`.bottom-nav-item.active`);
        if (indicator) {
          if (activeItem) {
            indicator.style.opacity = '1';
            indicator.style.display = 'block';
            const targetLeft = activeItem.offsetLeft + (activeItem.offsetWidth / 2) - 30; // 30 is half of 60px
            const currentLeft = parseFloat(indicator.style.left) || targetLeft;
            
            if (currentLeft !== targetLeft) {
              const distance = Math.abs(targetLeft - currentLeft);
              const movingRight = targetLeft > currentLeft;
              
              indicator.style.transition = 'width 0.2s cubic-bezier(0.25, 1, 0.5, 1), left 0.2s cubic-bezier(0.25, 1, 0.5, 1)';
              
              // Stretch step
              if (movingRight) {
                indicator.style.width = `${distance + 60}px`;
              } else {
                indicator.style.left = `${targetLeft}px`;
                indicator.style.width = `${distance + 60}px`;
              }
              
              // Snap back step
              setTimeout(() => {
                indicator.style.width = '60px';
                if (movingRight) {
                  indicator.style.left = `${targetLeft}px`;
                }
              }, 200);
            } else {
              // First render
              indicator.style.transition = 'none';
              indicator.style.width = '60px';
              indicator.style.left = `${targetLeft}px`;
            }
          } else {
            indicator.style.opacity = '0';
            indicator.style.display = 'none';
          }
        }
      });
    });

    // Restore sidebar collapsed state on desktop
    const isSidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    const sidebarEl = document.getElementById('sidebar');
    if (sidebarEl && isSidebarCollapsed && window.innerWidth >= 1024) {
      sidebarEl.classList.add('collapsed');
    }

    // Render page content
    this.renderPage(route);
  },

  renderSidebar(user) {
    const initials = user.nome.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    
    if (user.role === 'criador') {
      return `
      <nav class="creator-navbar">
        <div class="creator-navbar-menu">
          <div class="nav-item creator-navbar-item" data-route="admin-dashboard" data-tooltip="Dashboard" onclick="App.navigate('admin-dashboard')">
            <span class="nav-icon"><i data-lucide="layout-dashboard"></i></span>
          </div>
          <div class="nav-item creator-navbar-item" data-route="cronograma" data-tooltip="Cronograma" onclick="App.navigate('cronograma')">
            <span class="nav-icon"><i data-lucide="calendar-days"></i></span>
          </div>
          <div class="nav-item creator-navbar-item" data-route="planejamento" data-tooltip="Planejamento" onclick="App.navigate('planejamento')">
            <span class="nav-icon"><i data-lucide="kanban"></i></span>
          </div>
          <div class="nav-item creator-navbar-item" data-route="clientes" data-tooltip="Parcerias" onclick="App.navigate('clientes')">
            <span class="nav-icon"><i data-lucide="handshake"></i></span>
          </div>
          <div class="nav-item creator-navbar-item" data-route="financeiro" data-tooltip="Financeiro" onclick="App.navigate('financeiro')">
            <span class="nav-icon"><i data-lucide="dollar-sign"></i></span>
          </div>
          <div class="nav-item creator-navbar-item" data-route="metas" data-tooltip="Metas" onclick="App.navigate('metas')">
            <span class="nav-icon"><i data-lucide="target"></i></span>
          </div>
          <div class="nav-item creator-navbar-item" data-route="configuracoes" data-tooltip="Configurações" onclick="App.navigate('configuracoes')">
            <span class="nav-icon"><i data-lucide="settings"></i></span>
          </div>
          <div class="creator-navbar-logout-item" onclick="Auth.logout()" title="Sair do sistema">
            <i data-lucide="log-out"></i>
          </div>
        </div>
      </nav>
      `;
    }

    const isManagement = ['superadmin', 'admin', 'criador', 'editor'].includes(user.role);
    
    let adminNav = '';
    if (false) { // placeholder so structure doesn't conflict
      adminNav = '';
    } else {
      adminNav = `
        <div class="nav-section-title hig-sidebar-section-label">Principal</div>
        <div class="nav-item hig-sidebar-nav-item" data-route="admin-dashboard" onclick="App.navigate('admin-dashboard')">
          <span class="nav-icon"><i data-lucide="layout-dashboard"></i></span><span class="nav-text">Dashboard</span>
        </div>
        <div class="nav-item hig-sidebar-nav-item" data-route="cronograma" onclick="App.navigate('cronograma')">
          <span class="nav-icon"><i data-lucide="calendar-days"></i></span><span class="nav-text">Cronograma</span>
        </div>
        <div class="nav-section-divider hig-mobile-only"></div>
        <div class="nav-section-title hig-sidebar-section-label">Operacional</div>
        <div class="nav-item hig-sidebar-nav-item" data-route="gestao" onclick="App.navigate('gestao')">
          <span class="nav-icon"><i data-lucide="users"></i></span><span class="nav-text">Gestão</span>
        </div>
      <div class="nav-item hig-sidebar-nav-item" data-route="clientes" onclick="App.navigate('clientes')">
        <span class="nav-icon"><i data-lucide="building-2"></i></span><span class="nav-text">Clientes</span>
      </div>
      <div class="nav-item hig-sidebar-nav-item" data-route="orcamentos" onclick="App.navigate('orcamentos')">
        <span class="nav-icon"><i data-lucide="receipt"></i></span><span class="nav-text">Orçamentos</span>
      </div>
      <div class="nav-item hig-sidebar-nav-item" data-route="financeiro" onclick="App.navigate('financeiro')">
        <span class="nav-icon"><i data-lucide="dollar-sign"></i></span><span class="nav-text">Financeiro</span>
      </div>
      <div class="nav-item hig-sidebar-nav-item" data-route="metas" onclick="App.navigate('metas')">
        <span class="nav-icon"><i data-lucide="target"></i></span><span class="nav-text">Metas</span>
      </div>
      <div class="nav-item hig-sidebar-nav-item" data-route="relatorios" onclick="App.navigate('relatorios')">
        <span class="nav-icon"><i data-lucide="bar-chart-2"></i></span><span class="nav-text">Relatórios</span>
      </div>
      <div class="nav-section-divider hig-mobile-only"></div>
      <div class="nav-section-title hig-sidebar-section-label">Crescimento</div>
      <div class="nav-item hig-sidebar-nav-item" data-route="descobrir-canais" onclick="App.navigate('descobrir-canais')">
        <span class="nav-icon"><i data-lucide="tv-2"></i></span><span class="nav-text">Descobrir Canais</span>
      </div>
      <div class="nav-item hig-sidebar-nav-item" data-route="planejamento" onclick="App.navigate('planejamento')">
        <span class="nav-icon"><i data-lucide="kanban"></i></span><span class="nav-text">Planejamento</span>
      </div>
      <div class="nav-section-divider hig-mobile-only"></div>
      <div class="nav-section-title hig-sidebar-section-label">Sistema</div>
      ${(user.role === 'admin' || user.role === 'superadmin') ? `
      <div class="nav-item hig-sidebar-nav-item" data-route="dev" onclick="App.navigate('dev')">
        <span class="nav-icon"><i data-lucide="terminal"></i></span><span class="nav-text">Desenvolvimento</span>
      </div>
      ` : ''}
      ${user.role === 'superadmin' ? `
      <div class="nav-item hig-sidebar-nav-item" data-route="auditoria" onclick="App.navigate('auditoria')">
        <span class="nav-icon"><i data-lucide="shield-check"></i></span><span class="nav-text">Auditoria</span>
      </div>
      ` : ''}
      <div class="nav-item hig-sidebar-nav-item" data-route="configuracoes" onclick="App.navigate('configuracoes')">
        <span class="nav-icon"><i data-lucide="settings"></i></span><span class="nav-text">Configurações</span>
      </div>
    `;
    }

    const padeiroNav = `
      <div class="nav-section-title hig-sidebar-section-label">Menu</div>
      <div class="nav-item hig-sidebar-nav-item" data-route="padeiro-inicio" onclick="App.navigate('padeiro-inicio')">
        <span class="nav-icon"><i data-lucide="home"></i></span><span class="nav-text">Início</span>
      </div>
      <div class="nav-item hig-sidebar-nav-item" data-route="padeiro-atividade" onclick="App.navigate('padeiro-atividade')">
        <span class="nav-icon"><i data-lucide="clipboard-list"></i></span><span class="nav-text">Nova Atividade</span>
      </div>
      <div class="nav-item hig-sidebar-nav-item" data-route="padeiro-agenda" onclick="App.navigate('padeiro-agenda')">
        <span class="nav-icon"><i data-lucide="calendar-days"></i></span><span class="nav-text">Minha Agenda</span>
      </div>
    `;

    return `
    <aside class="sidebar hig-sidebar" id="sidebar">
      <div class="sidebar-header hig-mobile-only">
        <button class="sidebar-toggle-btn" onclick="App.toggleSidebar()">
          <i data-lucide="menu"></i>
        </button>
        <div style="font-family: 'Outfit', 'Inter', sans-serif; font-size: 16px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; display: flex; align-items: center; justify-content: center; width: 100%; gap: 6px; margin-bottom: 24px; opacity: 0.6;">
          <img src="/assets/tomada_logo_completa.svg" style="height: 24px;" alt="Tomada Logo">
        </div>
      </div>
      <div class="hig-sidebar-logo hig-desktop-only" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; box-sizing: border-box; width: 100%;">
        <div class="hig-logo-text-group" style="font-family: 'Outfit', 'Inter', sans-serif; font-size: 22px; font-weight: 800; color: #0F172A; letter-spacing: -0.02em; display: flex; align-items: center; gap: 8px; width: calc(100% - 28px); overflow: hidden;">
          <div class="hig-logo-img" style="height: 52px; display: flex; align-items: center; justify-content: flex-start; flex-shrink: 0; width: 100%;">
            ${this.getLogoSvg(false)}
          </div>
        </div>
        <button class="sidebar-toggle-btn hig-desktop-toggle-btn" onclick="App.toggleSidebar()" style="color: rgba(15, 23, 42, 0.7); background: transparent; border: none; cursor: pointer; padding: 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center; outline: none; transition: background-color 0.2s; flex-shrink: 0;">
          <i data-lucide="menu" style="width: 20px; height: 20px;"></i>
        </button>
      </div>
      <nav class="sidebar-nav hig-sidebar-nav">
        ${isManagement ? adminNav : padeiroNav}
      </nav>
      <!-- Créditos -->
      <div class="sidebar-credits">
        Designed & Developed by Abdias Alves
      </div>
      <!-- Mobile Footer -->
      <div class="sidebar-footer hig-mobile-only">
        <div class="sidebar-user">
          <div class="avatar">${initials}</div>
          <div class="user-info-text">
            <div class="user-name">${user.nome.split(' ').slice(0, 2).join(' ')}</div>
            <div class="user-role">${user.role === 'superadmin' ? 'Super Admin' : user.role === 'admin' ? 'Administrador' : user.role === 'gestor_geral' ? 'Gestor Geral' : user.role === 'gestor_regional' ? 'Gestor Regional' : user.cargo || 'Funcionário'}</div>
          </div>
        </div>
        <div class="nav-item hig-sidebar-nav-item" onclick="Auth.logout()" style="margin-top:8px;color:var(--danger)">
          <span class="nav-icon"><i data-lucide="log-out"></i></span><span class="nav-text">Sair</span>
        </div>
      </div>
      <!-- Desktop HIG Footer -->
      <div class="hig-sidebar-footer hig-desktop-only">
        <div class="hig-sidebar-avatar">${initials}</div>
        <div class="hig-sidebar-user-info">
          <span class="hig-sidebar-user-name">${user.nome.split(' ').slice(0, 2).join(' ')}</span>
          <span class="hig-sidebar-user-role">${user.role === 'superadmin' ? 'Super Admin' : user.role === 'admin' ? 'Administrador' : user.role === 'gestor_geral' ? 'Gestor Geral' : user.role === 'gestor_regional' ? 'Gestor Regional' : user.cargo || 'Funcionário'}</span>
        </div>
        <button class="hig-sidebar-logout-btn" onclick="Auth.logout()" aria-label="Sair do sistema">
          <i data-lucide="log-out" aria-hidden="true"></i>
        </button>
      </div>
    </aside>`;
  },

  renderBottomNavbar(user) {
    const isManagement = ['superadmin', 'admin', 'criador', 'editor'].includes(user.role);
    let items = [];

    if (isManagement) {
      if (user.role === 'criador') {
        items = [
          { route: 'admin-dashboard', label: 'Início', icon: 'home' },
          { route: 'clientes', label: 'Parcerias', icon: 'handshake' },
          { route: 'configuracoes', label: 'Config', icon: 'settings' }
        ];
      } else {
        items = [
          { route: 'admin-dashboard', label: 'Início', icon: 'home' },
          { route: 'clientes', label: 'Clientes', icon: 'building-2' },
          { route: 'gestao', label: 'Gestão', icon: 'users' },
          { route: 'configuracoes', label: 'Config', icon: 'settings' }
        ];
      }
    } else {
      items = [
        { route: 'padeiro-inicio', label: 'Início', icon: 'home' },
        { route: 'padeiro-agenda', label: 'Agenda', icon: 'calendar-days' },
        { route: 'padeiro-atividade', label: 'Atividade', icon: 'clipboard-list' }
      ];
    }

    const htmlItems = items.map(item => `
      <div class="nav-item bottom-nav-item" data-route="${item.route}" onclick="App.navigate('${item.route}')">
        <span class="bottom-nav-icon"><i data-lucide="${item.icon}"></i></span>
        <span class="bottom-nav-label">${item.label}</span>
      </div>
    `).join('');

    return `
      <nav class="bottom-navbar ${isManagement ? 'management-nav' : ''}" id="bottom-navbar">
        <div class="nav-indicator" id="nav-indicator"></div>
        ${htmlItems}
      </nav>
    `;
  },

  // Header configuration per route
  headerConfig: {
    'admin-dashboard':   { title: 'Início',                  showSearch: true,  searchPlaceholder: 'Buscar no sistema...',       showLargeTitle: true },
    'cronograma':        { title: 'Cronograma',              showSearch: false, searchPlaceholder: '',                          showLargeTitle: true },
    'gestao':            { title: 'Gestão',                  showSearch: true,  searchPlaceholder: 'Buscar funcionários...',      showLargeTitle: true },
    'produtos':          { title: 'Produtos',                showSearch: true,  searchPlaceholder: 'Buscar produtos...',          showLargeTitle: true },
    'clientes':          { title: 'Clientes',                showSearch: true,  searchPlaceholder: 'Buscar clientes...',          showLargeTitle: true },
    'metas':             { title: 'Metas de Produção',       showSearch: true,  searchPlaceholder: 'Buscar metas...',            showLargeTitle: true },
    'relatorios':        { title: 'Relatórios',              showSearch: false, searchPlaceholder: '',                          showLargeTitle: true },
    'orcamentos':        { title: 'Orçamentos',              showSearch: true,  searchPlaceholder: 'Buscar orçamentos...',       showLargeTitle: true },
    'financeiro':        { title: 'Visão Geral Financeira',  showSearch: false, searchPlaceholder: '',                          showLargeTitle: true },
    'padeiro-inicio':    { title: 'Meu Painel',              showSearch: false, searchPlaceholder: '',                          showLargeTitle: true },
    'padeiro-atividade': { title: 'Nova Atividade',          showSearch: false, searchPlaceholder: '',                          showLargeTitle: false },
    'padeiro-agenda':    { title: 'Minha Agenda',            showSearch: false, searchPlaceholder: '',                          showLargeTitle: true },
    'dev':               { title: 'Desenvolvimento',         showSearch: false, searchPlaceholder: '',                        showLargeTitle: true },
    'menor-preco':       { title: 'Encontrar menor preço',   showSearch: false, searchPlaceholder: '',                        showLargeTitle: false },
    'configuracoes':     { title: 'Configurações / Perfil',  showSearch: false, searchPlaceholder: '',               showLargeTitle: true },
    'auditoria':         { title: 'Auditoria de Segurança',  showSearch: false, searchPlaceholder: '',                          showLargeTitle: true },
    'descobrir-canais':  { title: 'Descobrir Canais',        showSearch: false, searchPlaceholder: '',                          showLargeTitle: true }
  },

  renderHeader(route) {
    const cfg = this.headerConfig[route] || { title: 'Sistema Padeiro', showSearch: false, searchPlaceholder: '', showLargeTitle: true };
    const user = API.getUser();
    let title = cfg.title;
    let searchPlaceholder = cfg.searchPlaceholder;
    if (user && user.role === 'criador') {
      if (route === 'descobrir-canais') {
        title = 'Buscar Parcerias';
      } else if (route === 'clientes') {
        title = 'Parcerias';
        searchPlaceholder = 'Buscar parcerias...';
      }
    }
    const initials = user ? user.nome.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : 'US';
    const hideHeaderStyles = ['admin-dashboard', 'gestao', 'cronograma', 'metas'].includes(route) ? 'style="display: none !important;"' : '';

    return `
    <!-- iOS-style Mobile Header (visible only on mobile) -->
    <div class="ios-header" id="ios-header" ${hideHeaderStyles}>
      <!-- Line 1: Nav Bar -->
      <div class="ios-navbar" id="ios-navbar">
        <button class="ios-nav-btn ios-menu-btn" onclick="App.openDrawer()" aria-label="Menu">
          <i data-lucide="menu" size="22"></i>
        </button>
        <div class="ios-navbar-center">
          <span class="ios-nav-title" id="ios-nav-title">${title}</span>
          <span class="ios-logo-text" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
            <img src="/assets/tomada_logo_completa.svg" style="height: 20px;" alt="Tomada Logo">
            
          </span>
        </div>
        <div class="ios-navbar-right">
          <button class="ios-nav-btn ios-notif-btn" aria-label="Notificações">
            <i data-lucide="bell" size="20"></i>
            <span class="ios-notif-badge" id="ios-notif-badge" style="display:none">0</span>
          </button>
          <button class="ios-nav-btn ios-avatar-btn" aria-label="Perfil">
            <div class="ios-avatar-circle">${initials}</div>
          </button>
        </div>
      </div>
      <!-- Line 2: Search Bar -->
      ${cfg.showSearch ? `
      <div class="ios-search-row">
        <div class="ios-search-bar" id="ios-search-bar">
          <i data-lucide="search" size="16"></i>
          <input type="text" placeholder="${searchPlaceholder || 'Buscar...'}" id="ios-search-input" />
        </div>
      </div>` : ''}
      <!-- Line 3: Large Title -->
      ${cfg.showLargeTitle ? `
      <div class="ios-large-title-row" id="ios-large-title-row">
        <h1 class="ios-large-title">${title}</h1>
      </div>` : ''}
      <!-- Separator (appears on scroll) -->
      <div class="ios-header-separator" id="ios-header-separator"></div>
    </div>

    <!-- Drawer Overlay -->
    <div class="ios-drawer-overlay" id="ios-drawer-overlay" onclick="App.closeDrawer()"></div>

    <!-- Desktop Header (hidden on mobile) -->
    <header class="top-header ios-desktop-header">
      <div class="header-left">
        <button class="toggle-sidebar" onclick="App.toggleSidebar()"><i data-lucide="menu"></i></button>
        <h2>${title}</h2>
      </div>
      <div class="header-right" style="display:flex;align-items:center;gap:24px;">
        <div id="global-search-container" style="min-width:250px;"></div>
        <span style="font-size:12px;color:var(--text-tertiary);font-weight:500;">${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>
    </header>`;
  },

  async renderPage(route) {
    const pageContainer = document.getElementById('page-container');
    if (pageContainer) {
      pageContainer.classList.remove('tf-page-active', 'clientes-page-active', 'metas-page-active', 'metas-view', 'orcamentos-page-active', 'page-exit-active', 'kanban-redesign-active', 'dc-page-active');
      pageContainer.style.width = '';
      pageContainer.style.maxWidth = '';
    }
    document.body.classList.remove('tf-page-active', 'dc-page-active', 'clientes-page-active', 'metas-page-active', 'dashboard-page-active', 'orcamentos-page-active', 'kanban-redesign-active', 'pf-multiselect-mode', 'pf-tutorial-active');
    document.body.style.width = '';

    const user = API.getUser();
    try {
      switch (route) {
        case 'admin-dashboard': 
          document.body.classList.add('dashboard-page-active');
          await AdminDashboard.render();
          break;
        case 'cronograma': await Cronograma.render(); break;
        case 'gestao':
        case 'produtos':
          if (route === 'produtos') Gestao.currentTab = 'produtos';
          await Gestao.render(); 
          break;
        case 'clientes':
          if (typeof Cronograma !== 'undefined' && Cronograma.renderStyles) {
            Cronograma.renderStyles();
          }
          document.getElementById('page-container').classList.add('tf-page-active', 'clientes-page-active');
          document.body.classList.add('tf-page-active', 'clientes-page-active');
          this.renderClientesPage('semanal');
          break;
        case 'metas': 
          document.getElementById('page-container').classList.add('metas-page-active');
          document.body.classList.add('metas-page-active');
          await Metas.render();
          break;
        case 'relatorios': await Relatorios.render(); break;
        case 'orcamentos': 
          document.getElementById('page-container').classList.add('orcamentos-page-active');
          document.body.classList.add('orcamentos-page-active');
          await Orcamentos.render(); 
          break;
        case 'financeiro': await Financeiro.render(); break;
        case 'padeiro-inicio': await PadeiroDashboard.render(); break;
        case 'padeiro-atividade': await PadeiroFlow.render(this.routeData || {}); break;
        case 'padeiro-agenda': await PadeiroAgenda.render(); break;
        case 'dev': await Dev.render(); break;
        case 'configuracoes': await Configuracoes.render(); break;
        case 'auditoria': await Auditoria.render(); break;
        case 'descobrir-canais': 
          if (API.getUser().role === 'criador') {
            await this.renderClientesPage('buscar');
          } else {
            document.getElementById('page-container').classList.add('dc-page-active');
            document.body.classList.add('dc-page-active');
            await DescubrirCanais.render(); 
          }
          break;
        case 'planejamento':
          if (typeof Planejamento !== 'undefined') {
            if (typeof Planejamento.init === 'function') {
              Planejamento.init();
            } else if (typeof Planejamento.render === 'function') {
              Planejamento.render();
            }
          } else if (window.Planejamento) {
            if (typeof window.Planejamento.init === 'function') {
              window.Planejamento.init();
            } else if (typeof window.Planejamento.render === 'function') {
              window.Planejamento.render();
            }
          }
          break;
        case 'menor-preco':
          await this.loadLeaflet();
          await Rastreamento.render();
          break;
        default:
          document.getElementById('page-container').innerHTML = Components.empty('search', 'Página não encontrada.');
      }
    } catch (error) {
      console.error("Erro ao renderizar página:", error);
      document.getElementById('page-container').innerHTML = Components.empty('alert-circle', 
        `Não foi possível carregar esta página offline. <br><small>${error.message}</small>`);
    }
    Components.renderIcons();
    // Trigger entrance animation
    const pc = document.getElementById('page-container');
    if (pc) {
      pc.classList.add('page-enter-active');
      pc.addEventListener('animationend', function handler() {
        pc.classList.remove('page-enter-active');
        pc.removeEventListener('animationend', handler);
      });
    }
    // Bind iOS header scroll collapse behavior
    this.bindHeaderScroll();
  },

  _translateClientesHtml(html) {
    if (API.getUser().role !== 'criador') return html;
    return html
      .replace(/>\+ Novo Cliente<\/span>/g, '>+ Nova Parceria</span>')
      .replace(/>\+ Novo<\/span>/g, '>+ Nova Parceria</span>')
      .replace(/>\+ Novo Cliente/g, '>+ Nova Parceria')
      .replace(/Novo Cliente<\/button>/g, 'Nova Parceria</button>')
      .replace(/>Novo Cliente/g, '>Nova Parceria')
      .replace(/>Salvar Cliente<\/button>/g, '>Salvar Parceria</button>')
      .replace(/>Salvar Cliente/g, '>Salvar Parceria')
      .replace(/Clientes Ativos/g, 'Parcerias Ativas')
      .replace(/Clientes Atendidos/g, 'Parcerias Ativas')
      .replace(/Novos Clientes/g, 'Novas Parcerias')
      .replace(/Todos os Clientes/g, 'Todas as Parcerias')
      .replace(/Nenhum cliente ativo/g, 'Nenhuma parceria ativa')
      .replace(/Buscar clientes por nome/g, 'Buscar parcerias por nome')
      .replace(/Buscar clientes/g, 'Buscar parcerias')
      .replace(/Buscar prospects/g, 'Buscar parcerias')
      .replace(/>Cliente<\/th>/g, '>Parceria</th>')
      .replace(/>Clientes<\/th>/g, '>Parcerias</th>')
      .replace(/>Clientes<\/span>/g, '>Parcerias</span>')
      .replace(/>clientes<\/span>/g, '>parcerias</span>')
      .replace(/Nome do Cliente/g, 'Nome da Parceria')
      .replace(/Cliente:/g, 'Parceria:')
      .replace(/Cliente\s/g, 'Parceria ')
      .replace(/cliente\s/g, 'parceria ')
      .replace(/>Cliente/g, '>Parceria')
      .replace(/>cliente/g, '>parceria')
      .replace(/>Clientes/g, '>Parcerias')
      .replace(/>clientes/g, '>parcerias')
      .replace(/\sCliente/g, ' Parceria')
      .replace(/\scliente/g, ' parceria')
      .replace(/\sClientes/g, ' Parcerias')
      .replace(/\sclientes/g, ' parcerias');
  },

  async renderClientesPage(subTab = 'semanal') {
    const user = API.getUser();
    const pageContainer = document.getElementById('page-container');
    if (!pageContainer) return;

    // Clean up active classes from canal search
    pageContainer.classList.remove('dc-page-active');
    document.body.classList.remove('dc-page-active');

    // Buscar Parcerias (Descobrir Canais) sub-tab: render directly without API call
    if (subTab === 'buscar') {
      this._clientesSubTab = subTab;
      this._renderBuscarParceriasPage(pageContainer, subTab);
      return;
    }

    // Show loading state
    pageContainer.innerHTML = `
      <style>
        body.tf-page-active .main-content { background: transparent !important; }
        body.tf-page-active #page-container { background: transparent !important; box-shadow: none !important; border-radius: 0 !important; }
        @keyframes clientes-spin { to { transform: rotate(360deg); } }
      </style>
      <div style="display: flex; align-items: center; justify-content: center; min-height: 400px; font-family: 'Outfit', sans-serif;">
        <div style="text-align: center; color: #FFFFFF;">
          <div style="width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.2); border-top-color: #E55A2B; border-radius: 50%; animation: clientes-spin 0.8s linear infinite; margin: 0 auto 16px;"></div>
          <span style="font-size: 14px; font-weight: 600; opacity: 0.8;">Carregando dados...</span>
        </div>
      </div>
    `;

    // Prospecção sub-tab: render directly without API call
    if (subTab === 'prospeccao') {
      this._clientesSubTab = subTab;
      this._renderProspeccaoPage(pageContainer, subTab);
      return;
    }

    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    if (!App.selectedTimelineMonth) {
      App.selectedTimelineMonth = meses[new Date().getMonth()];
    }

    // Fetch real data from API
    let stats;
    try {
      stats = await API.get(`/api/clientes/stats?periodo=${subTab}&mes=${App.selectedTimelineMonth}`);
    } catch (err) {
      console.warn('Erro ao buscar stats de clientes, usando fallback seguro:', err);
      const cached = typeof OfflineManager !== 'undefined' ? await OfflineManager.getCachedData(`/api/clientes/stats?periodo=${subTab}&mes=${App.selectedTimelineMonth}`) : null;
      stats = cached || {
        periodo: subTab,
        labelPeriodo: subTab === 'semanal' ? 'esta semana' : `mês de ${App.selectedTimelineMonth}`,
        totalClientes: 0,
        clientesAtivos: 0,
        receitaTotal: 0,
        custoInsumosTotal: 0,
        lucroLiquido: 0,
        chartDataFinanceiro: [],
        totalCronogramas: 0,
        concluidos: 0,
        pendentes: 0,
        emAndamento: 0,
        percentualConcluido: 0,
        totalAtividades: 0,
        totalFinalizadas: 0,
        producao: [{ nome: '—', qtd: 0 }],
        producaoTotal: 0,
        chartData: [],
        clientesMaisAtivos: [],
        proximosAgendamentos: [],
        clientesRecentes: []
      };
    }

    // Store current subtab for popup reloading
    this._clientesSubTab = subTab;

    if (window.innerWidth <= 768) {
      this._renderMobileClientesPage(pageContainer, stats, subTab);
    } else {
      this._renderDesktopClientesPage(pageContainer, stats, subTab);
    }
  },

  _renderMobileClientesPage(pageContainer, stats, subTab) {
    const lucroFormatado = `R$ ${(stats.lucroLiquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const initials = (nome) => nome.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const cores = ['#E55A2B', '#FF9A3C', '#1C1A14', '#7A7567', '#C8461B'];

    // Sparkline helper using quadratic curves for smooth lines and gradient area fill
    const buildSparklineSvg = (index) => {
      const isUp = index % 2 === 0;
      const strokeColor = isUp ? '#10B981' : '#FF9A3C'; // green or orange
      const gradId = `spark-grad-${index}`;
      
      const strokePath = isUp 
        ? 'M 5 20 Q 20 4, 30 14 T 55 4' 
        : 'M 5 4 Q 20 20, 30 10 T 55 22';
      const fillPath = isUp
        ? 'M 5 20 Q 20 4, 30 14 T 55 4 L 55 28 L 5 28 Z'
        : 'M 5 4 Q 20 20, 30 10 T 55 22 L 55 28 L 5 28 Z';
        
      return `
        <svg width="60" height="28" viewBox="0 0 60 28" fill="none" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">
          <defs>
            <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.2"/>
              <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0.0"/>
            </linearGradient>
          </defs>
          <path d="${fillPath}" fill="url(#${gradId})" />
          <path d="${strokePath}" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    };

    // Client card items
    let clientCardsHtml = '';
    if (stats.clientesMaisAtivos.length === 0) {
      clientCardsHtml = `
        <div style="text-align: center; padding: 48px 16px; color: #7A7567; font-size: 13px; font-weight: 600; background: #FFFFFF; border-radius: 22px;">
          <i data-lucide="users" style="width: 32px; height: 32px; margin-bottom: 8px; stroke-width: 1.5; color: #D2CABD; display: block; margin: 0 auto 8px;"></i>
          <div>Nenhum cliente ativo para este período</div>
        </div>
      `;
    } else {
      clientCardsHtml = stats.clientesMaisAtivos.map((c, idx) => {
        const cor = cores[idx % cores.length];
        const isUp = idx % 2 === 0;
        const trendPct = isUp ? `+${(10.21 + idx).toFixed(2)}%` : `-${(0.60 + idx * 0.1).toFixed(2)}%`;
        const trendClass = isUp ? 'up' : 'down';
        const trendIcon = isUp ? 'trending-up' : 'trending-down';
        const clientRevenue = c.receita ? `R$ ${c.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `${c.totalCronogramas} visitas`;

        return `
          <div class="m-cli-item cascade-item" style="--index: ${idx};" data-client-name="${c.nome.toLowerCase()}" onclick="Components.toast('Cliente: ${c.nome} • ${c.cidade || 'Sem Cidade'}', 'info')">
            <div class="m-cli-item-left">
              <div class="m-cli-avatar" style="background: ${cor};">
                ${initials(c.nome)}
              </div>
              <div class="m-cli-info">
                <span class="m-cli-name">${c.nome}</span>
                <span class="m-cli-details">${c.cidade || 'Sem Cidade'} • ${c.orcamentoDescricao ? c.orcamentoDescricao.split(',').slice(0, 1).join('') : 'Sem projetos'}</span>
              </div>
            </div>
            
            <div class="m-cli-sparkline">
              ${buildSparklineSvg(idx)}
            </div>
            
            <div class="m-cli-item-right">
              <span class="m-cli-value">${clientRevenue}</span>
              <span class="m-cli-trend ${trendClass}">
                <i data-lucide="${trendIcon}"></i> ${trendPct}
              </span>
            </div>
          </div>
        `;
      }).join('');
    }

    const html = `
      <div class="m-cli-layout-shell">
        <!-- Dark header card -->
        <div class="m-cli-header-card">
          <span class="m-cli-header-title">Ganho Líquido</span>
          <span class="m-cli-header-value">${lucroFormatado}</span>
          
          <div class="m-cli-actions-capsule">
            <button class="m-cli-action-btn" onclick="App.navigate('orcamentos')">
              <div class="m-cli-action-circle">
                <i data-lucide="clipboard-list"></i>
              </div>
              <span class="m-cli-action-label">Orçamento</span>
            </button>
            <button class="m-cli-action-btn" onclick="App.navigate('financeiro')">
              <div class="m-cli-action-circle">
                <i data-lucide="dollar-sign"></i>
              </div>
              <span class="m-cli-action-label">Financeiro</span>
            </button>
            <button class="m-cli-action-btn" onclick="App.navigate('metas')">
              <div class="m-cli-action-circle">
                <i data-lucide="target"></i>
              </div>
              <span class="m-cli-action-label">Metas</span>
            </button>
            <button class="m-cli-action-btn active" onclick="App.navigate('clientes')">
              <div class="m-cli-action-circle">
                <i data-lucide="building-2"></i>
              </div>
              <span class="m-cli-action-label">Clientes</span>
            </button>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="m-cli-search-container">
          <span class="m-cli-search-icon">
            <i data-lucide="search"></i>
          </span>
          <input type="text" class="m-cli-search-input" placeholder="Buscar clientes por nome..." oninput="App.filterMobileClientes(this.value)">
        </div>

        <!-- List Header -->
        <div class="m-cli-list-header">
          <span class="m-cli-list-title">Clientes Ativos</span>
          <div class="m-cli-list-filter" onclick="App.openMobileClientesPeriodPopover(event)">
            <span>${subTab === 'semanal' ? 'Semanal' : subTab === 'mensal' ? 'Mensal' : subTab === 'prospeccao' ? 'Prospecção' : 'Buscar Parcerias'}</span>
            <i data-lucide="chevron-down"></i>
          </div>
        </div>

        <!-- Client List Cards -->
        <div class="m-cli-list-container" id="m-cli-list-container">
          ${clientCardsHtml}
        </div>

        <!-- Floating Action Button for mobile -->
        <button onclick="Orcamentos.openChoiceModal()" class="m-cli-fab" style="position: fixed; bottom: 90px; right: 20px; width: 56px; height: 56px; border-radius: 50%; background: var(--primary); color: #FFFFFF; border: none; box-shadow: 0 4px 15px rgba(229, 90, 43, 0.4); display: flex; align-items: center; justify-content: center; z-index: 999; cursor: pointer; transition: transform 0.2s;">
          <i data-lucide="plus" style="width: 24px; height: 24px;"></i>
        </button>
      </div>
    `;
    pageContainer.innerHTML = html;
    if (API.getUser().role === 'criador') {
      pageContainer.innerHTML = this._translateClientesHtml(pageContainer.innerHTML);
    }
    Components.renderIcons();
  },

  filterMobileClientes(query) {
    const q = query.toLowerCase().trim();
    const items = document.querySelectorAll('.m-cli-item');
    items.forEach(item => {
      const name = item.getAttribute('data-client-name') || '';
      if (name.includes(q)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  },

  toggleMobileClientesPeriod(currentPeriod) {
    const nextPeriod = currentPeriod === 'semanal' ? 'mensal' : 'semanal';
    App.renderClientesPage(nextPeriod);
  },

  openMobileClientesPeriodPopover(e) {
    e.stopPropagation();
    const trigger = e.currentTarget;

    // Fechar outros popovers abertos
    document.querySelectorAll('.hig-select-menu').forEach(m => m.remove());

    const menu = document.createElement('div');
    menu.className = 'hig-select-menu period-popover-menu';
    menu.style.position = 'fixed';
    menu.style.zIndex = '999999';
    menu.style.opacity = '0';
    menu.style.transform = 'scale(0.95) translateY(-5px)';
    menu.style.transition = 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
    menu.style.width = '180px';

    const isCreator = API.getUser()?.role === 'criador';
    const options = [
      { id: 'semanal', label: 'Semanal' },
      { id: 'mensal', label: 'Mensal' },
      { id: 'prospeccao', label: 'Prospecção' }
    ];
    if (isCreator) {
      options.push({ id: 'buscar', label: 'Buscar Parcerias' });
    }

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'hig-select-items';

    options.forEach(opt => {
      const item = document.createElement('div');
      item.className = 'hig-select-item';
      if (this._clientesSubTab === opt.id) {
        item.classList.add('active');
      }
      item.innerHTML = `<span>${opt.label}</span>`;
      item.onclick = () => {
        menu.remove();
        App.renderClientesPage(opt.id);
      };
      itemsContainer.appendChild(item);
    });

    menu.appendChild(itemsContainer);
    document.body.appendChild(menu);

    const rect = trigger.getBoundingClientRect();
    menu.style.top = `${rect.bottom + window.scrollY + 6}px`;
    menu.style.left = `${rect.right - 180 + window.scrollX}px`;

    requestAnimationFrame(() => {
      menu.style.opacity = '1';
      menu.style.transform = 'scale(1) translateY(0)';
    });

    const closeHandler = () => {
      menu.style.opacity = '0';
      menu.style.transform = 'scale(0.95) translateY(-5px)';
      setTimeout(() => menu.remove(), 250);
      document.removeEventListener('click', closeHandler);
    };
    setTimeout(() => {
      document.addEventListener('click', closeHandler);
    }, 10);
  },

  _renderBuscarParceriasPage(pageContainer, subTab) {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      pageContainer.innerHTML = `
        <div class="m-cli-layout-shell">
          <div class="m-cli-header-card">
            <span class="m-cli-header-title">Buscar Parcerias</span>
            <span class="m-cli-header-value">Descobrir Canais</span>
            <div class="m-cli-actions-capsule" style="margin-top: 15px;">
              <div class="m-cli-list-filter" onclick="App.openMobileClientesPeriodPopover(event)" style="border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.1); padding: 8px 16px; border-radius: 12px; display: inline-flex; align-items: center; gap: 8px; color: #FFFFFF; font-weight: 700; cursor: pointer;">
                <span>Buscar Parcerias</span>
                <i data-lucide="chevron-down" style="width: 14px; height: 14px;"></i>
              </div>
            </div>
          </div>
          <div id="subtab-content-container" style="padding: 16px 0;"></div>
        </div>
      `;
    } else {
      pageContainer.innerHTML = `
        <style>
          body.tf-page-active .main-content { background: #F8F6F0 !important; }
          body.tf-page-active #page-container { background: #F8F6F0 !important; box-shadow: none !important; border-radius: 0 !important; }
        </style>
        <div style="font-family:'Outfit','Plus Jakarta Sans',-apple-system,sans-serif; display:flex; flex-direction:column; gap:20px; max-width:1400px; margin: 0 auto; padding: 0 24px; box-sizing: border-box; width: 100%;">
          <!-- Top Bar with Switcher -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
            <div style="height: 38px; display: flex; align-items: center;">
              ${this.getLogoSvg ? this.getLogoSvg(false) : '<span style="font-size:20px;font-weight:800;color:#1C1A14;">Bancada</span>'}
            </div>
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="background: #FFFFFF; padding: 4px; border-radius: 14px; display: flex; gap: 4px; border: 1px solid #E2E8F0; position: relative; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
                <div style="position: absolute; top: 4px; left: 4px; width: calc(25% - 5px); height: calc(100% - 8px); background: #1C1A14; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); transform: translateX(${subTab === 'mensal' ? '100%' : subTab === 'prospeccao' ? '200%' : subTab === 'buscar' ? '300%' : '0'});"></div>
                <button onclick="App.renderClientesPage('semanal')" style="position:relative; z-index:1; ${subTab === 'semanal' ? 'color: #FFFFFF; font-weight: 800;' : 'color: #7A7567; font-weight: 600;'} background:transparent; border:none; padding:6px 15px; border-radius:10px; font-size:13px; cursor:pointer; font-family:'Outfit',sans-serif;">Semanal</button>
                <button onclick="App.renderClientesPage('mensal')" style="position:relative; z-index:1; ${subTab === 'mensal' ? 'color: #FFFFFF; font-weight: 800;' : 'color: #7A7567; font-weight: 600;'} background:transparent; border:none; padding:6px 15px; border-radius:10px; font-size:13px; cursor:pointer; font-family:'Outfit',sans-serif;">Mensal</button>
                <button onclick="App.renderClientesPage('prospeccao')" style="position:relative; z-index:1; ${subTab === 'prospeccao' ? 'color: #FFFFFF; font-weight: 800;' : 'color: #7A7567; font-weight: 600;'} background:transparent; border:none; padding:6px 15px; border-radius:10px; font-size:13px; cursor:pointer; font-family:'Outfit',sans-serif;">Prospecção</button>
                <button onclick="App.renderClientesPage('buscar')" style="position:relative; z-index:1; ${subTab === 'buscar' ? 'color: #FFFFFF; font-weight: 800;' : 'color: #7A7567; font-weight: 600;'} background:transparent; border:none; padding:6px 15px; border-radius:10px; font-size:13px; cursor:pointer; font-family:'Outfit',sans-serif;">Buscar Parcerias</button>
              </div>
            </div>
          </div>
          <div id="subtab-content-container"></div>
        </div>
      `;
    }

    // Add dc-page-active classes so styles apply correctly
    document.getElementById('page-container').classList.add('dc-page-active');
    document.body.classList.add('dc-page-active');

    const contentContainer = document.getElementById('subtab-content-container');
    if (typeof DescubrirCanais !== 'undefined') {
      DescubrirCanais.renderInContainer(contentContainer);
    }
  },

  _renderDesktopClientesPage(pageContainer, stats, subTab) {
    const user = API.getUser();
    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const mesAtual = meses[new Date().getMonth()];

    let subtitleText = "";
    let stat1Label = "";
    let stat1Value = "";
    let stat2Label = "";
    let stat2Value = "";

    if (subTab === 'semanal') {
      subtitleText = "Métricas e cronogramas acumulados desta semana.";
      stat1Label = "Cronogramas Semana";
      stat1Value = `${stats.totalCronogramas} <span style="font-size: 15px; font-weight: 500; color: rgba(255, 255, 255, 0.7);">tarefas</span>`;
      stat2Label = "Clientes Atendidos";
      stat2Value = `${stats.clientesMaisAtivos.length} <span style="font-size: 15px; font-weight: 500; color: rgba(255, 255, 255, 0.7);">clientes</span>`;
    } else {
      subtitleText = "Métricas e cronogramas acumulados deste mês.";
      stat1Label = "Cronogramas Mês";
      stat1Value = `${stats.totalCronogramas} <span style="font-size: 15px; font-weight: 500; color: rgba(255, 255, 255, 0.7);">tarefas</span>`;
      stat2Label = "Novos Clientes";
      stat2Value = `${stats.clientesRecentes.length} <span style="font-size: 15px; font-weight: 500; color: rgba(255, 255, 255, 0.7);">recentes</span>`;
    }

    const ringPercentage = stats.percentualConcluido + '%';
    const ringOverlayWidth = stats.percentualConcluido + '%';
    const ringLegend = `
      <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #7A7567;">
        <span style="width: 8px; height: 8px; background: #E55A2B; border-radius: 50%;"></span> Concluído (${stats.concluidos})
      </div>
      <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #7A7567;">
        <span style="width: 8px; height: 8px; background: #FF9A3C; border-radius: 50%;"></span> Andamento (${stats.emAndamento})
      </div>
      <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #7A7567;">
        <span style="width: 8px; height: 8px; background: #D2CABD; border-radius: 50%;"></span> Pendente (${stats.pendentes})
      </div>
    `;

    const chartTitle = 'Receita vs Insumos';
    const lucroFormatado = `R$ ${(stats.lucroLiquido || 0).toFixed(2).replace('.', ',')}`;
    const receitaFormatada = `R$ ${(stats.receitaTotal || 0).toFixed(2).replace('.', ',')}`;
    const custoFormatado = `R$ ${(stats.custoInsumosTotal || 0).toFixed(2).replace('.', ',')}`;

    const buildFinancialChartSvg = (chartDataFinanceiro) => {
      if (!chartDataFinanceiro || chartDataFinanceiro.length === 0) {
        return `<svg viewBox="0 0 300 120" style="width:100%;height:100%;overflow:visible;">
          <line x1="0" y1="30" x2="300" y2="30" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>
          <line x1="0" y1="65" x2="300" y2="65" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>
          <line x1="0" y1="100" x2="300" y2="100" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>
          <text x="150" y="58" text-anchor="middle" fill="#7A7567" font-size="11" font-family="Outfit,sans-serif">Sem dados financeiros</text>
        </svg>`;
      }

      const W = 300, H = 110, PAD = 8;
      const maxVal = Math.max(...chartDataFinanceiro.map(d => d.receita), 1);
      const barWidth = Math.max(12, (W - PAD * 2) / chartDataFinanceiro.length - 8);

      let bars = '';
      chartDataFinanceiro.forEach((d, i) => {
        const x = PAD + i * ((W - PAD * 2) / chartDataFinanceiro.length) + 4;
        const hReceita = Math.max(4, (d.receita / maxVal) * (H - PAD * 2));
        const hInsumo = Math.max(2, (d.custoInsumos / maxVal) * (H - PAD * 2));
        const yReceita = H - PAD - hReceita;
        const yInsumo = H - PAD - hInsumo;

        bars += `<rect x="${x}" y="${yReceita}" width="${barWidth * 0.45}" height="${hReceita}" rx="3" fill="#E55A2B" opacity="1"/>`;
        bars += `<rect x="${x + barWidth * 0.5}" y="${yInsumo}" width="${barWidth * 0.45}" height="${hInsumo}" rx="3" fill="#FF9A3C" opacity="0.85"/>`;
        bars += `<text x="${x + barWidth * 0.25}" y="${H - 1}" text-anchor="middle" fill="#7A7567" font-size="7" font-family="Outfit,sans-serif">${d.nome.slice(0, 6)}</text>`;
      });

      return `<svg viewBox="0 0 300 120" style="width:100%;height:100%;overflow:visible;">
        <line x1="0" y1="30" x2="300" y2="30" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>
        <line x1="0" y1="65" x2="300" y2="65" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>
        <line x1="0" y1="100" x2="300" y2="100" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>
        ${bars}
      </svg>`;
    };
    const financialChartSvg = buildFinancialChartSvg(stats.chartDataFinanceiro || []);

    const prodObj = stats.producao;
    const prod = Array.isArray(prodObj) ? prodObj : [];
    const maxProd = Math.max(...prod.map(p => p.qtd), 1);
    const barScale = (v) => Math.max(8, Math.round((v / maxProd) * 100));
    const barChartTitle = subTab === 'semanal' ? 'Produção por Tipo (Semanal)' : 'Produção por Tipo (Mensal)';
    const barChartHtml = `
      <div style="display: flex; justify-content: space-around; align-items: flex-end; height: 130px; padding-bottom: 8px; border-bottom: 1px solid #D2CABD;">
        ${prod.map(p => {
          const displayName = p.nome.length > 12 ? p.nome.slice(0, 10) + '...' : p.nome;
          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%; justify-content: flex-end; width: 22%;">
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <span style="font-size: 11px; font-weight: 800; color: #E55A2B;">${p.qtd > 0 ? p.qtd : ''}</span>
                <div style="width: 14px; height: ${barScale(p.qtd)}px; background: linear-gradient(180deg, #E55A2B 0%, #FF9A3C 100%); border-radius: 4px; transition: height 0.3s;"></div>
              </div>
              <span title="${p.nome}" style="font-size: 10px; font-weight: 700; color: #7A7567; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;">${displayName}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;

    const tableTitles = { semanal: 'Cronogramas da Semana', mensal: 'Cronogramas do Mês' };
    const tableTitle = tableTitles[subTab] || 'Cronogramas da Semana';
    const tableHeadersHtml = `
      <th style="padding: 10px 0; font-size: 12px; font-weight: 700; color: #7A7567; text-transform: uppercase; letter-spacing: 0.5px;">Cliente</th>
      <th style="padding: 10px 0; font-size: 12px; font-weight: 700; color: #7A7567; text-transform: uppercase; letter-spacing: 0.5px;">Cronogramas</th>
      <th style="padding: 10px 0; font-size: 12px; font-weight: 700; color: #7A7567; text-transform: uppercase; letter-spacing: 0.5px;">Status</th>
      <th style="padding: 10px 0; font-size: 12px; font-weight: 700; color: #7A7567; text-transform: uppercase; letter-spacing: 0.5px;">Checklist</th>
      <th style="padding: 10px 0; font-size: 12px; font-weight: 700; color: #7A7567; text-transform: uppercase; letter-spacing: 0.5px;">Concluídos</th>
    `;

    let tableRowsHtml = '';
    if (stats.clientesMaisAtivos.length === 0) {
      tableRowsHtml = `
        <tr>
          <td colspan="5" style="padding: 30px 0; text-align: center; font-size: 14px; color: #7A7567; font-weight: 600;">
            Nenhum cronograma ${stats.labelPeriodo}
          </td>
        </tr>
      `;
    } else {
      const initials = (nome) => nome.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const cores = ['#E55A2B', '#FF9A3C', '#1C1A14', '#7A7567', '#C8461B'];
      stats.clientesMaisAtivos.forEach((c, idx) => {
        const cor = cores[idx % cores.length];
        const statusLabel = c.concluidos > 0 && c.pendentes === 0 ? 'Concluído' : c.emAndamento > 0 ? 'Em andamento' : 'Pendente';
        const statusIcon = statusLabel === 'Concluído' ? '✅' : statusLabel === 'Em andamento' ? '⏳' : '🔴';

        const clTotal = c.checklistTotal || 0;
        const clDone = c.checklistDone || 0;
        const clPercent = clTotal > 0 ? Math.round((clDone / clTotal) * 100) : 0;
        const checklistHtml = clTotal > 0 ? `
          <div style="display: flex; align-items: center; gap: 6px;">
            <div style="flex: 1; height: 6px; background: #F0EDE8; border-radius: 3px; overflow: hidden; min-width: 60px;">
              <div style="height: 100%; width: ${clPercent}%; background: ${clPercent === 100 ? '#10B981' : '#E55A2B'}; border-radius: 3px; transition: width 0.3s;"></div>
            </div>
            <span style="font-size: 11px; font-weight: 700; color: ${clPercent === 100 ? '#10B981' : '#7A7567'};">${clDone}/${clTotal}</span>
          </div>
        ` : '<span style="font-size: 12px; color: #D2CABD;">—</span>';

        tableRowsHtml += `
          <tr style="border-bottom: 1px solid #FDFBF9;">
            <td style="padding: 14px 0; display: flex; align-items: center; gap: 12px;">
              <div style="width: 38px; height: 38px; border-radius: 50%; background: ${cor}; display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 13px; font-weight: 800; flex-shrink: 0;">
                ${initials(c.nome)}
              </div>
              <div>
                <div style="font-size: 14px; font-weight: 700; color: #1C1A14;">${c.nome}</div>
                <div style="font-size: 11px; color: #7A7567; font-weight: 500;" title="${c.orcamentoDescricao || ''}">
                  ${c.cidade ? c.cidade + ' • ' : ''}
                  ${c.orcamentoDescricao ? (c.orcamentoDescricao.length > 20 ? c.orcamentoDescricao.substring(0, 20) + '....' : c.orcamentoDescricao) : 'Sem projetos'}
                </div>
              </div>
            </td>
            <td style="padding: 14px 0; font-size: 14px; font-weight: 600; color: #1C1A14;">${c.totalCronogramas} tarefa${c.totalCronogramas !== 1 ? 's' : ''}</td>
            <td style="padding: 14px 0; font-size: 13px; font-weight: 700; color: ${statusLabel === 'Concluído' ? '#10B981' : statusLabel === 'Em andamento' ? '#FF9A3C' : '#94A3B8'};">${statusIcon} ${statusLabel}</td>
            <td style="padding: 14px 0; min-width: 100px;">${checklistHtml}</td>
            <td style="padding: 14px 0; font-size: 14px; font-weight: 700; color: #1C1A14;">${c.concluidos}</td>
          </tr>
        `;
      });
    }

    const timelineTitle = subTab === 'semanal' ? 'Cronograma da Semana' : 'Próximos Agendamentos';
    const timelineMonth = App.selectedTimelineMonth;
    let timelineItemsHtml = '';

    if (stats.proximosAgendamentos.length === 0) {
      timelineItemsHtml = `
        <div style="text-align: center; padding: 20px; font-size: 14px; color: #7A7567; font-weight: 600;">
          Nenhum agendamento pendente
        </div>
      `;
    } else {
      const timelineColors = ['#FF9A3C', '#E55A2B', 'rgba(229, 90, 43, 0.1)'];
      const diasSemana = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
      stats.proximosAgendamentos.forEach((ag, idx) => {
        const bgColor = timelineColors[idx % timelineColors.length];
        const textColor = idx === 0 ? '#1C1A14' : idx === 1 ? '#FFFFFF' : '#E55A2B';
        const dateObj = new Date(ag.data + 'T12:00:00');
        const dayNum = String(dateObj.getDate()).padStart(2, '0');
        const dayName = diasSemana[dateObj.getDay()];
        const dotBorder = idx < 2 ? `box-shadow: 0 0 0 2px ${bgColor};` : `box-shadow: 0 0 0 2px rgba(229, 90, 43, 0.2);`;

        timelineItemsHtml += `
          <div style="display: flex; gap: 20px; align-items: center; position: relative; z-index: 1;">
            <div style="width: 35px; text-align: right; display: flex; flex-direction: column; justify-content: center;">
              <span style="font-size: 14px; font-weight: 900; color: #1C1A14;">${dayNum}</span>
              <span style="font-size: 11px; color: #7A7567; font-weight: 700; text-transform: uppercase;">${dayName}</span>
            </div>
            <div style="width: 12px; height: 12px; background: ${bgColor}; border: 3px solid #FFFFFF; border-radius: 50%; ${dotBorder}"></div>
            <div style="flex: 1; background: ${bgColor}; color: ${textColor}; padding: 12px 16px; border-radius: 18px; font-weight: 700; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 13px;">${ag.clienteNome}</span>
              <span style="font-size: 11px; opacity: 0.8; font-variant-numeric: tabular-nums;">${ag.padeiroNome || ag.horario || ag.turno || ''}</span>
            </div>
          </div>
        `;
      });
    }

    const html = `
      <div style="
        background: transparent;
        padding: 0 24px;
        font-family: 'Outfit', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #FFFFFF;
        display: flex;
        flex-direction: column;
        gap: 24px;
        max-width: 1400px;
        margin: 0 auto;
        width: 100%;
        box-sizing: border-box;
      ">
        <!-- Top Bar -->
        <div class="cascade-item" style="--index: 0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div style="height: 38px; display: flex; align-items: center; justify-content: flex-start; flex-shrink: 0;">
            ${this.getLogoSvg(true)}
          </div>
          
          <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
            ${user.role === 'criador' ? `
            <div style="background: rgba(0, 0, 0, 0.25); padding: 4px; border-radius: 14px; display: flex; gap: 4px; border: 1px solid rgba(255, 255, 255, 0.08); position: relative; overflow: hidden;">
              <div style="position: absolute; top: 4px; left: 4px; width: calc(25% - 5px); height: calc(100% - 8px); background: #FFFFFF; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); transform: translateX(${subTab === 'mensal' ? '100%' : subTab === 'prospeccao' ? '200%' : subTab === 'buscar' ? '300%' : '0'});"></div>
              <button onclick="App.renderClientesPage('semanal')" style="position: relative; z-index: 1; ${subTab === 'semanal' ? 'color: #E55A2B; font-weight: 800;' : 'color: #FFFFFF; opacity: 0.8; font-weight: 600;'} background: transparent; border: none; padding: 6px 15px; border-radius: 10px; font-size: 13px; cursor: pointer; transition: all 0.2s; font-family: 'Outfit', sans-serif;">Semanal</button>
              <button onclick="App.renderClientesPage('mensal')" style="position: relative; z-index: 1; ${subTab === 'mensal' ? 'color: #E55A2B; font-weight: 800;' : 'color: #FFFFFF; opacity: 0.8; font-weight: 600;'} background: transparent; border: none; padding: 6px 15px; border-radius: 10px; font-size: 13px; cursor: pointer; transition: all 0.2s; font-family: 'Outfit', sans-serif;">Mensal</button>
              <button onclick="App.renderClientesPage('prospeccao')" style="position: relative; z-index: 1; ${subTab === 'prospeccao' ? 'color: #E55A2B; font-weight: 800;' : 'color: #FFFFFF; opacity: 0.8; font-weight: 600;'} background: transparent; border: none; padding: 6px 15px; border-radius: 10px; font-size: 13px; cursor: pointer; transition: all 0.2s; font-family: 'Outfit', sans-serif;">Prospecção</button>
              <button onclick="App.renderClientesPage('buscar')" style="position: relative; z-index: 1; ${subTab === 'buscar' ? 'color: #E55A2B; font-weight: 800;' : 'color: #FFFFFF; opacity: 0.8; font-weight: 600;'} background: transparent; border: none; padding: 6px 15px; border-radius: 10px; font-size: 13px; cursor: pointer; transition: all 0.2s; font-family: 'Outfit', sans-serif;">Buscar Parcerias</button>
            </div>
            ` : `
            <div style="background: rgba(0, 0, 0, 0.25); padding: 4px; border-radius: 14px; display: flex; gap: 4px; border: 1px solid rgba(255, 255, 255, 0.08); position: relative; overflow: hidden;">
              <div style="position: absolute; top: 4px; left: 4px; width: calc(33.33% - 5px); height: calc(100% - 8px); background: #FFFFFF; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); transform: translateX(${subTab === 'mensal' ? '100%' : subTab === 'prospeccao' ? '200%' : '0'});"></div>
              <button onclick="App.renderClientesPage('semanal')" style="position: relative; z-index: 1; ${subTab === 'semanal' ? 'color: #E55A2B; font-weight: 800;' : 'color: #FFFFFF; opacity: 0.8; font-weight: 600;'} background: transparent; border: none; padding: 6px 20px; border-radius: 10px; font-size: 13px; cursor: pointer; transition: all 0.2s; font-family: 'Outfit', sans-serif;">Semanal</button>
              <button onclick="App.renderClientesPage('mensal')" style="position: relative; z-index: 1; ${subTab === 'mensal' ? 'color: #E55A2B; font-weight: 800;' : 'color: #FFFFFF; opacity: 0.8; font-weight: 600;'} background: transparent; border: none; padding: 6px 20px; border-radius: 10px; font-size: 13px; cursor: pointer; transition: all 0.2s; font-family: 'Outfit', sans-serif;">Mensal</button>
              <button onclick="App.renderClientesPage('prospeccao')" style="position: relative; z-index: 1; ${subTab === 'prospeccao' ? 'color: #E55A2B; font-weight: 800;' : 'color: #FFFFFF; opacity: 0.8; font-weight: 600;'} background: transparent; border: none; padding: 6px 20px; border-radius: 10px; font-size: 13px; cursor: pointer; transition: all 0.2s; font-family: 'Outfit', sans-serif;">Prospecção</button>
            </div>
            `}
          </div>
        </div>

        <!-- Welcome Block & Quick Stats -->
        <div class="cascade-item" style="--index: 1; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 20px;">
          <div>
            <h2 style="font-size: 32px; font-weight: 800; margin: 0; color: #FFFFFF; letter-spacing: -0.8px;">Olá, ${user.nome.split(' ')[0]}!</h2>
            <p style="font-size: 14px; color: rgba(255, 255, 255, 0.8); margin: 4px 0 0 0; font-weight: 500;">${subtitleText}</p>
          </div>

          <div style="display: flex; align-items: center; gap: 32px; flex-wrap: wrap;">
            <div>
              <span style="font-size: 12px; color: rgba(255, 255, 255, 0.7); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Ganho Líquido</span>
              <div style="font-size: 26px; font-weight: 800; color: #FFFFFF; margin-top: 2px;">${lucroFormatado}</div>
            </div>
            <div style="width: 1px; height: 40px; background: rgba(255, 255, 255, 0.15);"></div>
            <div>
              <span style="font-size: 12px; color: rgba(255, 255, 255, 0.7); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${stat1Label}</span>
              <div style="font-size: 26px; font-weight: 800; color: #FFFFFF; margin-top: 2px;">${stat1Value}</div>
            </div>
            <div style="width: 1px; height: 40px; background: rgba(255, 255, 255, 0.15);"></div>
            <div>
              <span style="font-size: 12px; color: rgba(255, 255, 255, 0.7); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${stat2Label}</span>
              <div style="font-size: 26px; font-weight: 800; color: #FFFFFF; margin-top: 2px;">${stat2Value}</div>
            </div>
            <button onclick="App.openNewClientePopup()" style="background: #1C1A14; color: #FFFFFF; border: none; padding: 12px 24px; border-radius: 16px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(28, 26, 20, 0.25); transition: transform 0.2s;">
              <span>+</span> Novo Cliente
            </button>
            <button onclick="Orcamentos.openChoiceModal()" style="background: var(--primary); color: #FFFFFF; border: none; padding: 12px 24px; border-radius: 16px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(229, 90, 43, 0.25); transition: transform 0.2s;">
              <span>+</span> Novo
            </button>
          </div>
        </div>

        <!-- Bento Grid -->
        <div class="clientes-bento-grid" style="display: grid; grid-template-columns: 1fr 1.3fr 1fr; gap: 24px; width: 100%;">
          <div class="cascade-item" style="--index: 2; background: #FFFFFF; border-radius: 28px; padding: 24px; display: flex; flex-direction: column; gap: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 16px; font-weight: 800; color: #1C1A14;">Status de Cronogramas</span>
              <span style="font-size: 12px; color: #1C1A14; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                <span style="width: 6px; height: 6px; background: #E55A2B; border-radius: 50%;"></span> Período
              </span>
            </div>
            <div style="display: flex; align-items: center; justify-content: center; position: relative; padding: 10px 0;">
              <div style="width: 100%; height: 100px; border: 12px solid #FDFBF7; border-radius: 50px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
                <div style="position: absolute; left: 0; top: 0; width: ${ringOverlayWidth}; height: 100%; background: linear-gradient(90deg, #E55A2B 0%, #FF9A3C 100%); opacity: 0.15;"></div>
                <div style="position: absolute; left: 0; top: 0; width: ${ringOverlayWidth}; height: 100%; border: 12px solid transparent; border-left-color: #E55A2B; border-right-color: #FF9A3C; border-top-color: #E55A2B; border-bottom-color: #E55A2B; border-radius: 50px; box-sizing: border-box;"></div>
                <span style="font-size: 34px; font-weight: 900; color: #1C1A14; letter-spacing: -1px; z-index: 1;">${ringPercentage}</span>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #F5EFEB;">
              ${ringLegend}
            </div>
          </div>

          <div class="cascade-item" style="--index: 3; background: #FFFFFF; border-radius: 28px; padding: 24px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 16px; font-weight: 800; color: #1C1A14;">${chartTitle}</span>
              <div style="display: flex; gap: 12px; align-items: center;">
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span style="width: 8px; height: 8px; background: #E55A2B; border-radius: 2px;"></span>
                  <span style="font-size: 10px; color: #7A7567; font-weight: 600;">Receita</span>
                </div>
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span style="width: 8px; height: 8px; background: #FF9A3C; border-radius: 2px;"></span>
                  <span style="font-size: 10px; color: #7A7567; font-weight: 600;">Insumos</span>
                </div>
              </div>
            </div>
            <div style="height: 130px; position: relative; margin-top: 10px;">
              ${financialChartSvg}
              <div style="position: absolute; top: -12px; left: 64%; background: #1C1A14; color: #FFFFFF; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; box-shadow: 0 4px 10px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center;">
                Ganho Líquido: ${lucroFormatado}
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 700; color: #7A7567; padding: 8px 0; border-top: 1px solid #F5EFEB;">
              <span>Receita: <span style="color: #1C1A14;">${receitaFormatada}</span></span>
              <span>Insumos: <span style="color: #1C1A14;">${custoFormatado}</span></span>
              <span style="color: ${(stats.lucroLiquido || 0) >= 0 ? '#059669' : '#DC2626'};">Ganho Líquido: ${lucroFormatado}</span>
            </div>
          </div>

          <div class="cascade-item" style="--index: 4; background: #FFFFFF; border-radius: 28px; padding: 24px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 16px; font-weight: 800; color: #1C1A14;">${barChartTitle}</span>
              <span style="font-size: 12px; color: #7A7567; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                <span style="width: 6px; height: 6px; background: #FF9A3C; border-radius: 50%;"></span> unidades
              </span>
            </div>
            ${barChartHtml}
          </div>
        </div>

        <!-- Bottom Grid -->
        <div class="clientes-bottom-grid" style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; width: 100%;">
          <div class="cascade-item" style="--index: 5; background: #FFFFFF; border-radius: 28px; padding: 24px; display: flex; flex-direction: column; gap: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
              <span style="font-size: 18px; font-weight: 800; color: #1C1A14;">${tableTitle}</span>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="background: #F5EFEB; padding: 3px; border-radius: 10px; display: flex; gap: 2px; position: relative;">
                  <div style="position: absolute; top: 3px; left: 3px; width: calc(50% - 4px); height: calc(100% - 6px); background: #FFFFFF; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); transform: translateX(${subTab === 'mensal' ? '100%' : '0'});"></div>
                  <button onclick="App.renderClientesPage('semanal')" style="position: relative; z-index: 1; background: transparent; border: none; padding: 5px 14px; border-radius: 8px; font-size: 12px; font-weight: ${subTab === 'semanal' ? '800' : '600'}; color: ${subTab === 'semanal' ? '#E55A2B' : '#7A7567'}; cursor: pointer; font-family: 'Outfit', sans-serif; transition: all 0.2s;">Semanal</button>
                  <button onclick="App.renderClientesPage('mensal')" style="position: relative; z-index: 1; background: transparent; border: none; padding: 5px 14px; border-radius: 8px; font-size: 12px; font-weight: ${subTab === 'mensal' ? '800' : '600'}; color: ${subTab === 'mensal' ? '#E55A2B' : '#7A7567'}; cursor: pointer; font-family: 'Outfit', sans-serif; transition: all 0.2s;">Mensal</button>
                </div>
              </div>
            </div>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                  <tr style="border-bottom: 1px solid #F5EFEB; padding-bottom: 12px;">
                    ${tableHeadersHtml}
                  </tr>
                </thead>
                <tbody>
                  ${tableRowsHtml}
                </tbody>
              </table>
            </div>
          </div>

          <div class="cascade-item" style="--index: 6; background: #FFFFFF; border-radius: 28px; padding: 24px; display: flex; flex-direction: column; gap: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 17px; font-weight: 800; color: #1C1A14;">${timelineTitle}</span>
              <span id="timeline-month-selector" onclick="App.openTimelineMonthPopover(event)" style="font-size: 13px; color: #7A7567; font-weight: 700; display: flex; align-items: center; gap: 6px; cursor: pointer; background: #FFFFFF; border: 1px solid rgba(0,0,0,0.08); padding: 6px 14px; border-radius: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); transition: all 0.2s;">
                ${timelineMonth} <i data-lucide="chevron-down" style="width: 14px; height: 14px; color: #7A7567;"></i>
              </span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 20px; position: relative;">
              <div style="position: absolute; left: 45px; top: 10px; bottom: 10px; width: 2px; background: #F5EFEB; z-index: 0;"></div>
              ${timelineItemsHtml}
            </div>
          </div>
        </div>
      </div>
    `;
    pageContainer.innerHTML = html;
    if (API.getUser().role === 'criador') {
      pageContainer.innerHTML = this._translateClientesHtml(pageContainer.innerHTML);
    }
    Components.renderIcons();
  },

  openNewClientePopup() {
    const formHtml = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div>
          <label class="cliente-form-label" style="font-size: 13px; font-weight: 700; color: #7A7567; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block;">Nome do Cliente</label>
          <input type="text" id="new-cliente-nome" class="cliente-form-input" placeholder="Ex: Padaria São João" style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #E2E8F0; font-size: 14px; outline: none; box-sizing: border-box;" />
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <label class="cliente-form-label" style="font-size: 13px; font-weight: 700; color: #7A7567; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block;">Receita Mensal (R$)</label>
            <input type="number" id="new-cliente-receita" class="cliente-form-input" placeholder="Ex: 10000" step="0.01" min="0" style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #E2E8F0; font-size: 14px; outline: none; box-sizing: border-box;" />
          </div>
          <div>
            <label class="cliente-form-label" style="font-size: 13px; font-weight: 700; color: #7A7567; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block;">Custo de Insumos (R$)</label>
            <input type="number" id="new-cliente-insumos" class="cliente-form-input" placeholder="Ex: 3000" step="0.01" min="0" style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #E2E8F0; font-size: 14px; outline: none; box-sizing: border-box;" />
          </div>
        </div>
        <div>
          <label class="cliente-form-label" style="font-size: 13px; font-weight: 700; color: #7A7567; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block;">Endereço Completo</label>
          <input type="text" id="new-cliente-endereco" class="cliente-form-input" placeholder="Ex: Av. Paulista, 1000" style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #E2E8F0; font-size: 14px; outline: none; box-sizing: border-box;" />
        </div>
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
          <div>
            <label class="cliente-form-label" style="font-size: 13px; font-weight: 700; color: #7A7567; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block;">Bairro</label>
            <input type="text" id="new-cliente-bairro" class="cliente-form-input" placeholder="Ex: Jardins" style="width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #E2E8F0; font-size: 14px; outline: none; box-sizing: border-box;" />
          </div>
          <div>
            <label class="cliente-form-label" style="font-size: 13px; font-weight: 700; color: #7A7567; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block;">UF (Estado)</label>
            <input type="text" id="new-cliente-estado" class="cliente-form-input" placeholder="Ex: SP" maxlength="2" style="text-transform: uppercase; width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid #E2E8F0; font-size: 14px; outline: none; box-sizing: border-box;" />
          </div>
        </div>
        <div id="new-cliente-preview" style="background: #FDFBF9; border-radius: 16px; padding: 16px; display: none; border: 1px solid rgba(0,0,0,0.05);">
          <div style="font-size: 13px; font-weight: 700; color: #7A7567; margin-bottom: 8px;">Prévia do Ganho Líquido</div>
          <div style="display: flex; justify-content: space-between; align-items: center; text-align: center;">
            <div style="flex: 1;">
              <span style="font-size: 11px; color: #7A7567; display: block; margin-bottom: 2px;">Receita</span>
              <div id="preview-receita" style="font-size: 16px; font-weight: 800; color: #E55A2B;">R$ 0,00</div>
            </div>
            <span style="font-size: 20px; color: #D2CABD; flex-shrink: 0; padding: 0 4px;">−</span>
            <div style="flex: 1;">
              <span style="font-size: 11px; color: #7A7567; display: block; margin-bottom: 2px;">Insumos</span>
              <div id="preview-insumos" style="font-size: 16px; font-weight: 800; color: #FF9A3C;">R$ 0,00</div>
            </div>
            <span style="font-size: 20px; color: #D2CABD; flex-shrink: 0; padding: 0 4px;">=</span>
            <div style="flex: 1;">
              <span style="font-size: 11px; color: #7A7567; display: block; margin-bottom: 2px;">Ganho Líquido</span>
              <div id="preview-lucro" style="font-size: 16px; font-weight: 800; color: #10B981;">R$ 0,00</div>
            </div>
          </div>
        </div>
      </div>
    `;

    const isCreator = API.getUser().role === 'criador';
    const translatedTitle = isCreator ? 'Nova Parceria' : 'Novo Cliente';
    const translatedForm = isCreator ? this._translateClientesHtml(formHtml) : formHtml;
    const translatedSaveButton = isCreator ? 'Salvar Parceria' : 'Salvar Cliente';

    Components.showModal(
      translatedTitle,
      translatedForm,
      `<button class="btn btn-secondary" onclick="Components.closeModal()">Cancelar</button>
       <button class="btn" style="background: #E55A2B; color: #FFFFFF; border: none; padding: 10px 24px; border-radius: 12px; font-weight: 700; cursor: pointer;" onclick="App.saveNewCliente()">${translatedSaveButton}</button>`
    );

    // Bind live preview
    setTimeout(() => {
      const receitaInput = document.getElementById('new-cliente-receita');
      const insumosInput = document.getElementById('new-cliente-insumos');
      if (receitaInput && insumosInput) {
        const updatePreview = () => {
          const r = parseFloat(receitaInput.value) || 0;
          const i = parseFloat(insumosInput.value) || 0;
          const lucro = r - i;
          const preview = document.getElementById('new-cliente-preview');
          if (preview) {
            preview.style.display = (r > 0 || i > 0) ? 'block' : 'none';
            document.getElementById('preview-receita').textContent = `R$ ${r.toFixed(2).replace('.', ',')}`;
            document.getElementById('preview-insumos').textContent = `R$ ${i.toFixed(2).replace('.', ',')}`;
            const lucroEl = document.getElementById('preview-lucro');
            lucroEl.textContent = `R$ ${lucro.toFixed(2).replace('.', ',')}`;
            lucroEl.style.color = lucro >= 0 ? '#10B981' : '#EF4444';
          }
        };
        receitaInput.addEventListener('input', updatePreview);
        insumosInput.addEventListener('input', updatePreview);
      }
    }, 100);
  },

  async saveNewCliente() {
    const nome = document.getElementById('new-cliente-nome')?.value?.trim();
    const receita = parseFloat(document.getElementById('new-cliente-receita')?.value) || 0;
    const custoInsumos = parseFloat(document.getElementById('new-cliente-insumos')?.value) || 0;
    const endereco = document.getElementById('new-cliente-endereco')?.value?.trim();
    const estado = document.getElementById('new-cliente-estado')?.value?.trim()?.toUpperCase();
    const bairro = document.getElementById('new-cliente-bairro')?.value?.trim();

    if (!nome) {
      Components.showAlert('Campo Obrigatório', 'Por favor, preencha o nome do cliente.');
      return;
    }

    try {
      await API.post('/api/clientes', { nome, receita, custoInsumos, endereco, estado, bairro });
      Components.closeModal();
      Components.toast('Cliente criado com sucesso!', 'success');
      this.renderClientesPage(this._clientesSubTab || 'semanal');
    } catch (err) {
      Components.showAlert('Erro', err.message || 'Erro ao criar cliente.');
    }
  },

  openTimelineMonthPopover(e) {
    e.stopPropagation();
    const trigger = e.currentTarget;

    // Fechar outros popovers abertos
    document.querySelectorAll('.hig-select-menu').forEach(m => m.remove());

    const menu = document.createElement('div');
    menu.className = 'hig-select-menu month-popover-menu';
    menu.style.position = 'fixed';
    menu.style.zIndex = '999999';
    menu.style.opacity = '0';
    menu.style.transform = 'scale(0.95) translateY(-5px)';
    menu.style.transition = 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
    menu.style.width = '160px';
    menu.style.maxHeight = '250px';
    menu.style.overflowY = 'auto';

    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'hig-select-items';

    meses.forEach(opt => {
      const item = document.createElement('div');
      item.className = 'hig-select-item';
      if (App.selectedTimelineMonth === opt) {
        item.classList.add('selected');
        item.innerHTML = `<span>${opt}</span><i data-lucide="check" class="hig-check" style="width:16px;height:16px;color:#E55A2B;"></i>`;
      } else {
        item.innerHTML = `<span>${opt}</span>`;
      }

      item.addEventListener('click', (ev) => {
        ev.stopPropagation();
        menu.remove();
        document.removeEventListener('click', closeHandler);

        App.selectedTimelineMonth = opt;
        App.renderClientesPage(App._clientesSubTab || 'semanal');
      });

      itemsContainer.appendChild(item);
    });

    menu.appendChild(itemsContainer);
    document.body.appendChild(menu);

    const rect = trigger.getBoundingClientRect();
    menu.style.left = `${rect.right - 160}px`;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedHeight = Math.min(250, meses.length * 36);

    let top;
    if (spaceBelow < estimatedHeight + 10 && spaceAbove > spaceBelow) {
      top = rect.top - estimatedHeight - 4;
      menu.style.transformOrigin = 'bottom center';
    } else {
      top = rect.bottom + 4;
      menu.style.transformOrigin = 'top center';
    }
    menu.style.top = `${top}px`;

    if (window.lucide) {
      window.lucide.createIcons({ root: menu });
    }

    requestAnimationFrame(() => {
      menu.style.opacity = '1';
      menu.style.transform = 'scale(1) translateY(0)';
    });

    const closeHandler = (ev) => {
      if (!menu.contains(ev.target) && ev.target !== trigger) {
        menu.remove();
        document.removeEventListener('click', closeHandler);
      }
    };
    document.addEventListener('click', closeHandler);
  },

  // Desktop sidebar toggle with localStorage and Leaflet map support
  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    
    if (window.innerWidth >= 1024) {
      sidebar.classList.toggle('collapsed');
      localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    } else {
      // Toggle mobile drawer
      sidebar.classList.toggle('mobile-open');
      const overlay = document.getElementById('ios-drawer-overlay');
      if (overlay) {
        overlay.classList.toggle('active', sidebar.classList.contains('mobile-open'));
      }
    }
  },

  // === iOS MOBILE DRAWER ===
  openDrawer() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('ios-drawer-overlay');
    if (sidebar) sidebar.classList.add('mobile-open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeDrawer() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('ios-drawer-overlay');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  },

  // === iOS HEADER SCROLL COLLAPSE ===
  bindHeaderScroll() {
    const pageContainer = document.getElementById('page-container');
    const largeTitleRow = document.getElementById('ios-large-title-row');
    const navTitle = document.getElementById('ios-nav-title');
    const separator = document.getElementById('ios-header-separator');
    const logoText = document.querySelector('.ios-logo-text');

    if (!pageContainer || !largeTitleRow) return;

    // Remove event listener antigo se houver para evitar vazamento de memória e conflitos
    if (this._scrollListener) {
      pageContainer.removeEventListener('scroll', this._scrollListener);
    }

    // Reset state
    navTitle && navTitle.classList.remove('visible');
    separator && separator.classList.remove('visible');
    if (logoText) logoText.style.display = 'flex';

    this._scrollListener = () => {
      const scrollY = pageContainer.scrollTop;
      const threshold = 44; // Altura aproximada do Large Title

      if (scrollY > threshold) {
        largeTitleRow.classList.add('collapsed');
        navTitle && navTitle.classList.add('visible');
        separator && separator.classList.add('visible');
        if (logoText) logoText.style.display = 'none';
      } else {
        largeTitleRow.classList.remove('collapsed');
        navTitle && navTitle.classList.remove('visible');
        separator && separator.classList.remove('visible');
        if (logoText) logoText.style.display = 'flex';
      }
    };

    pageContainer.addEventListener('scroll', this._scrollListener, { passive: true });

    // Conectar busca iOS com a lógica global
    const iosSearchInput = document.getElementById('ios-search-input');
    if (iosSearchInput) {
      iosSearchInput.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase();
        const searchEvent = new CustomEvent('app-search', { detail: value });
        document.dispatchEvent(searchEvent);
      });
    }
  },

  loadLeaflet() {
    return new Promise((resolve) => {
      if (window.L) return resolve();

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Inject custom styling for Leaflet markers
      if (!document.getElementById('mp-leaflet-style')) {
        const style = document.createElement('style');
        style.id = 'mp-leaflet-style';
        style.textContent = `
          .mp-custom-div-icon {
            background: none !important;
            border: none !important;
            box-shadow: none !important;
            width: auto !important;
            height: auto !important;
          }
          @keyframes mpMarkerDrop {
            0%   { transform: translateY(-20px) scale(0.85); opacity: 0; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
          }
          @keyframes mpMarkerBounce {
            0%, 100% { transform: scale(1); }
            50%      { transform: scale(1.2); }
          }
          @keyframes mpPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(229,90,43,0.5); }
            50%       { box-shadow: 0 0 0 12px rgba(229,90,43,0); }
          }
          .mp-marker-drop  { animation: mpMarkerDrop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .mp-marker-bounce { animation: mpMarkerBounce 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .mp-marker-pulse  { animation: mpPulse 1.4s ease-in-out infinite; }
          .mp-price-chip {
            background: white;
            border-radius: 20px;
            padding: 4px 9px 4px 7px;
            font-size: 11px;
            font-weight: 800;
            color: #1F2937;
            box-shadow: 0 2px 8px rgba(0,0,0,0.18);
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
            transition: transform 0.15s;
            white-space: nowrap;
          }
          .mp-price-chip:hover { transform: scale(1.06); }
          .mp-price-chip .dot {
            width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
          }
          .mp-search-overlay {
            position: absolute; inset: 0; z-index: 500;
            display: flex; align-items: center; justify-content: center;
            pointer-events: none;
          }
          .mp-search-pill {
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(12px);
            border-radius: 100px;
            padding: 10px 20px;
            display: flex; align-items: center; gap: 10px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.15);
            font-size: 13px; font-weight: 700; color: #374151;
            pointer-events: none;
            animation: mpMarkerDrop 0.4s ease forwards;
          }
          .mp-search-spinner {
            width: 18px; height: 18px; border-radius: 50%;
            border: 2.5px solid #E5E7EB;
            border-top-color: var(--primary);
            animation: spin 0.7s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);
      }

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  },

  loadMapboxGL() {
    return this.loadLeaflet();
  },

  // ═══════════════════════════════════════════════════════════
  //  PROSPECÇÃO — Master/Detail layout for sent proposals
  // ═══════════════════════════════════════════════════════════
  _renderProspeccaoPage(pageContainer, subTab) {
    if (this._prospeccaoFilter === undefined) this._prospeccaoFilter = 'todos';
    if (this._prospeccaoSearch === undefined) this._prospeccaoSearch = '';

    const user = API.getUser();
    const prospectsKey = 'bancada_prospects_' + (user ? (user.email || user.id || 'default') : 'default');
    const all = JSON.parse(localStorage.getItem(prospectsKey) || '[]');
    
    // Apply filters
    let prospects = all;
    if (this._prospeccaoFilter !== 'todos') {
      prospects = prospects.filter(p => p.status === this._prospeccaoFilter);
    }
    if (this._prospeccaoSearch) {
      prospects = prospects.filter(p =>
        (p.channelName || '').toLowerCase().includes(this._prospeccaoSearch) ||
        (p.category || '').toLowerCase().includes(this._prospeccaoSearch)
      );
    }

    const formatSubs = (n) => {
      if (!n || n === 0) return '—';
      if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
      if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
      return String(n);
    };

    const formatDate = (iso) => {
      if (!iso) return '—';
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const statusColors = {
      enviado:    { bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', label: 'Enviado' },
      respondido: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981', label: 'Respondido' },
      contratado: { bg: 'rgba(229, 90, 43, 0.1)',  color: '#E55A2B', label: 'Contratado' },
      arquivado:  { bg: 'rgba(122, 117, 103, 0.1)', color: '#7A7567', label: 'Arquivado' }
    };

    const categoryIcons = {
      'Games & Jogos': 'gamepad-2',
      'Tecnologia': 'cpu',
      'Design & UX': 'palette',
      'Educação': 'graduation-cap',
      'Culinária': 'chef-hat',
      'Negócios': 'briefcase',
      'Geral': 'globe'
    };

    const buildListItem = (p, isSelected) => {
      const st = statusColors[p.status] || statusColors.enviado;
      const catIcon = categoryIcons[p.category] || 'globe';
      return `
        <div class="prsp-list-item ${isSelected ? 'prsp-selected' : ''}" onclick="App._selectProspect('${p.channelId}')" style="
          display: flex; gap: 14px; padding: 16px 18px; cursor: pointer; border-radius: 16px;
          border: 2px solid ${isSelected ? '#E55A2B' : 'transparent'};
          background: ${isSelected ? 'rgba(229, 90, 43, 0.04)' : '#FFFFFF'};
          transition: all 0.2s; margin-bottom: 8px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        ">
          <img src="${p.channelAvatar || 'https://i.pravatar.cc/40?u=' + p.channelId}" style="width:44px; height:44px; border-radius:50%; object-fit:cover; flex-shrink:0; border: 2px solid ${isSelected ? '#E55A2B' : '#F0ECE4'};" />
          <div style="flex:1; min-width:0;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <span style="font-weight:700; font-size:14px; color:#1C1A14; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:160px;">${p.channelName}</span>
              <i data-lucide="bookmark" style="width:14px; height:14px; color:#CBD5E1; flex-shrink:0;"></i>
            </div>
            <p style="font-size:12px; color:#7A7567; margin:0 0 8px 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:500;">${p.description ? p.description.slice(0, 60) + '...' : p.category}</p>
            <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
              <span style="font-size:11px; font-weight:700; color:${st.color}; background:${st.bg}; padding:2px 8px; border-radius:6px;">${st.label}</span>
              <span style="font-size:11px; font-weight:600; color:#7A7567;"><i data-lucide="${catIcon}" style="width:11px; height:11px; display:inline;"></i> ${p.category}</span>
              <span style="font-size:11px; font-weight:600; color:#7A7567; margin-left:auto;">${formatDate(p.sentAt)}</span>
            </div>
          </div>
        </div>
      `;
    };

    const buildDetailPanel = (p) => {
      if (!p) return `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:#7A7567; text-align:center; padding:40px;">
          <i data-lucide="mail-search" style="width:48px; height:48px; margin-bottom:16px; opacity:0.4;"></i>
          <span style="font-size:16px; font-weight:700; color:#1C1A14; margin-bottom:4px;">Selecione um prospect</span>
          <span style="font-size:13px; font-weight:500;">Clique em um item da lista para ver os detalhes da proposta enviada</span>
        </div>
      `;
      const st = statusColors[p.status] || statusColors.enviado;
      const catIcon = categoryIcons[p.category] || 'globe';
      const contactIcons = { email: 'mail', discord: 'message-circle', instagram: 'instagram', twitter: 'twitter', site: 'globe', tiktok: 'music' };
      const contactsHtml = (p.contacts || []).map(c => `
        <span style="display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:600; color:#475569; background:#F1F5F9; padding:4px 10px; border-radius:8px;">
          <i data-lucide="${contactIcons[c] || 'link'}" style="width:13px;height:13px;"></i> ${c}
        </span>
      `).join('');

      return `
        <!-- Header -->
        <div style="display:flex; align-items:center; gap:16px; margin-bottom:24px; padding-bottom:20px; border-bottom:1px solid #F0ECE4;">
          <img src="${p.channelAvatar || 'https://i.pravatar.cc/56?u=' + p.channelId}" style="width:56px; height:56px; border-radius:50%; border:3px solid #E55A2B; object-fit:cover;" />
          <div style="flex:1;">
            <h3 style="margin:0; font-size:20px; font-weight:800; color:#1C1A14;">${p.channelName}</h3>
            <span style="font-size:13px; font-weight:600; color:#7A7567;">${p.channelUrl || '@canal'}</span>
          </div>
          <div style="display:flex; gap:8px;">
            <button onclick="App._updateProspectStatus('${p.channelId}', 'respondido')" style="display:flex; align-items:center; gap:6px; padding:8px 16px; border-radius:10px; border:1px solid #10B981; background:rgba(16,185,129,0.08); color:#10B981; font-size:12px; font-weight:700; cursor:pointer;"><i data-lucide="check-circle" style="width:14px;height:14px;"></i> Respondido</button>
            <button onclick="App._reenviarProposta('${p.channelId}')" style="display:flex; align-items:center; gap:6px; padding:8px 16px; border-radius:10px; border:none; background:#E55A2B; color:white; font-size:12px; font-weight:700; cursor:pointer;"><i data-lucide="send" style="width:14px;height:14px;"></i> Reenviar</button>
          </div>
        </div>

        <!-- Stats Row -->
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; margin-bottom:24px;">
          <div style="background:#FDFBF9; padding:14px 16px; border-radius:14px; text-align:center; border:1px solid #F0ECE4;">
            <div style="font-size:11px; font-weight:700; color:#7A7567; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Inscritos</div>
            <div style="font-size:18px; font-weight:800; color:#1C1A14;">${formatSubs(p.subscribers)}</div>
          </div>
          <div style="background:#FDFBF9; padding:14px 16px; border-radius:14px; text-align:center; border:1px solid #F0ECE4;">
            <div style="font-size:11px; font-weight:700; color:#7A7567; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Vídeos</div>
            <div style="font-size:18px; font-weight:800; color:#1C1A14;">${p.videoCount || '—'}</div>
          </div>
          <div style="background:#FDFBF9; padding:14px 16px; border-radius:14px; text-align:center; border:1px solid #F0ECE4;">
            <div style="font-size:11px; font-weight:700; color:#7A7567; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Nicho</div>
            <div style="font-size:13px; font-weight:700; color:#E55A2B;"><i data-lucide="${catIcon}" style="width:14px;height:14px;display:inline;"></i> ${p.category}</div>
          </div>
          <div style="background:#FDFBF9; padding:14px 16px; border-radius:14px; text-align:center; border:1px solid #F0ECE4;">
            <div style="font-size:11px; font-weight:700; color:#7A7567; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">Status</div>
            <span style="font-size:12px; font-weight:700; color:${st.color}; background:${st.bg}; padding:3px 10px; border-radius:6px;">${st.label}</span>
          </div>
        </div>

        <!-- Contatos Detectados -->
        ${contactsHtml ? `<div style="margin-bottom:20px;"><div style="font-size:12px; font-weight:700; color:#7A7567; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Contatos Detectados</div><div style="display:flex; gap:8px; flex-wrap:wrap;">${contactsHtml}</div></div>` : ''}

        <!-- Proposta Enviada -->
        <div style="margin-bottom:20px;">
          <div style="font-size:12px; font-weight:700; color:#7A7567; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">Proposta Enviada</div>
          <div style="background:#FDFBF9; border:1px solid #F0ECE4; border-radius:14px; padding:16px;">
            <div style="font-size:13px; font-weight:700; color:#E55A2B; margin-bottom:8px;"><i data-lucide="mail" style="width:14px;height:14px;display:inline;"></i> ${p.subject}</div>
            <div style="font-size:13px; color:#475569; line-height:1.6; white-space:pre-wrap; font-weight:500; max-height:300px; overflow-y:auto;">${p.body}</div>
          </div>
        </div>

        <!-- Timeline -->
        <div>
          <div style="font-size:12px; font-weight:700; color:#7A7567; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:12px;">Histórico</div>
          <div style="display:flex; flex-direction:column; gap:12px; padding-left:16px; border-left:2px solid #F0ECE4;">
            <div style="display:flex; align-items:center; gap:10px; position:relative;">
              <div style="position:absolute; left:-23px; width:12px; height:12px; border-radius:50%; background:#E55A2B; border:2px solid white;"></div>
              <span style="font-size:12px; font-weight:700; color:#1C1A14;">Proposta enviada por e-mail</span>
              <span style="font-size:11px; color:#7A7567; margin-left:auto; font-weight:600;">${formatDate(p.sentAt)}</span>
            </div>
            ${p.status === 'respondido' || p.status === 'contratado' ? `<div style="display:flex; align-items:center; gap:10px; position:relative;"><div style="position:absolute; left:-23px; width:12px; height:12px; border-radius:50%; background:#10B981; border:2px solid white;"></div><span style="font-size:12px; font-weight:700; color:#1C1A14;">Canal respondeu</span></div>` : ''}
            ${p.status === 'contratado' ? `<div style="display:flex; align-items:center; gap:10px; position:relative;"><div style="position:absolute; left:-23px; width:12px; height:12px; border-radius:50%; background:#F59E0B; border:2px solid white;"></div><span style="font-size:12px; font-weight:700; color:#1C1A14;">Contrato fechado 🎉</span></div>` : ''}
          </div>
        </div>

        <!-- Ações Adicionais -->
        <div style="display:flex; gap:10px; margin-top:24px; padding-top:20px; border-top:1px solid #F0ECE4;">
          <button onclick="App._openContratarProspectModal('${p.channelId}')" style="flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:10px; border-radius:10px; border:1px solid #F59E0B; background:rgba(245,158,11,0.06); color:#D97706; font-size:12px; font-weight:700; cursor:pointer;"><i data-lucide="handshake" style="width:14px;height:14px;"></i> Marcar Contratado</button>
          <button onclick="App._updateProspectStatus('${p.channelId}', 'arquivado')" style="flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:10px; border-radius:10px; border:1px solid #CBD5E1; background:#F8FAFC; color:#64748B; font-size:12px; font-weight:700; cursor:pointer;"><i data-lucide="archive" style="width:14px;height:14px;"></i> Arquivar</button>
        </div>
      `;
    };

    // Selected resolution
    if (!this._selectedProspectId && prospects.length > 0) {
      this._selectedProspectId = prospects[0].channelId;
    } else if (this._selectedProspectId && !prospects.some(p => p.channelId === this._selectedProspectId)) {
      this._selectedProspectId = prospects.length > 0 ? prospects[0].channelId : null;
    }
    const selectedId = this._selectedProspectId;

    const prospectsCount = prospects.length;
    const listHtml = prospects.length > 0
      ? prospects.map(p => buildListItem(p, p.channelId === selectedId)).join('')
      : `<div style="text-align:center; padding:40px 20px; color:#7A7567;"><i data-lucide="inbox" style="width:40px;height:40px;margin-bottom:12px;opacity:0.4;"></i><div style="font-weight:700; color:#1C1A14; margin-bottom:4px;">Nenhum prospect ainda</div><div style="font-size:13px;">Envie propostas pela aba Descobrir Canais para vê-los aqui</div></div>`;

    const detailHtml = buildDetailPanel(prospects.find(p => p.channelId === selectedId) || null);

    const html = `
      <style>
        body.tf-page-active .main-content { background: #F8F6F0 !important; }
        body.tf-page-active #page-container { background: #F8F6F0 !important; box-shadow: none !important; border-radius: 0 !important; }
        .prsp-list-item:hover { border-color: #E55A2B !important; box-shadow: 0 2px 8px rgba(229,90,43,0.08) !important; }
      </style>
      <div style="font-family:'Outfit','Plus Jakarta Sans',-apple-system,sans-serif; display:flex; flex-direction:column; gap:20px; max-width:1400px; margin: 0 auto; padding: 0 24px; box-sizing: border-box; width: 100%;">
        <!-- Top Bar with Switcher -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div style="height: 38px; display: flex; align-items: center;">
            ${this.getLogoSvg ? this.getLogoSvg(false) : '<span style="font-size:20px;font-weight:800;color:#1C1A14;">Bancada</span>'}
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            ${user.role === 'criador' ? `
            <div style="background: #FFFFFF; padding: 4px; border-radius: 14px; display: flex; gap: 4px; border: 1px solid #E2E8F0; position: relative; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
              <div style="position: absolute; top: 4px; left: 4px; width: calc(25% - 5px); height: calc(100% - 8px); background: #1C1A14; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); transform: translateX(${subTab === 'mensal' ? '100%' : subTab === 'prospeccao' ? '200%' : subTab === 'buscar' ? '300%' : '0'});"></div>
              <button onclick="App.renderClientesPage('semanal')" style="position:relative; z-index:1; ${subTab === 'semanal' ? 'color: #FFFFFF; font-weight: 800;' : 'color: #7A7567; font-weight: 600;'} background:transparent; border:none; padding:6px 15px; border-radius:10px; font-size:13px; cursor:pointer; font-family:'Outfit',sans-serif;">Semanal</button>
              <button onclick="App.renderClientesPage('mensal')" style="position:relative; z-index:1; ${subTab === 'mensal' ? 'color: #FFFFFF; font-weight: 800;' : 'color: #7A7567; font-weight: 600;'} background:transparent; border:none; padding:6px 15px; border-radius:10px; font-size:13px; cursor:pointer; font-family:'Outfit',sans-serif;">Mensal</button>
              <button onclick="App.renderClientesPage('prospeccao')" style="position:relative; z-index:1; ${subTab === 'prospeccao' ? 'color: #FFFFFF; font-weight: 800;' : 'color: #7A7567; font-weight: 600;'} background:transparent; border:none; padding:6px 15px; border-radius:10px; font-size:13px; cursor:pointer; font-family:'Outfit',sans-serif;">Prospecção</button>
              <button onclick="App.renderClientesPage('buscar')" style="position:relative; z-index:1; ${subTab === 'buscar' ? 'color: #FFFFFF; font-weight: 800;' : 'color: #7A7567; font-weight: 600;'} background:transparent; border:none; padding:6px 15px; border-radius:10px; font-size:13px; cursor:pointer; font-family:'Outfit',sans-serif;">Buscar Parcerias</button>
            </div>
            ` : `
            <div style="background: #FFFFFF; padding: 4px; border-radius: 14px; display: flex; gap: 4px; border: 1px solid #E2E8F0; position: relative; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
              <div style="position: absolute; top: 4px; left: 4px; width: calc(33.33% - 5px); height: calc(100% - 8px); background: #1C1A14; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); transform: translateX(${subTab === 'mensal' ? '100%' : subTab === 'prospeccao' ? '200%' : '0'});"></div>
              <button onclick="App.renderClientesPage('semanal')" style="position:relative; z-index:1; ${subTab === 'semanal' ? 'color: #FFFFFF; font-weight: 800;' : 'color: #7A7567; font-weight: 600;'} background:transparent; border:none; padding:6px 20px; border-radius:10px; font-size:13px; cursor:pointer; font-family:'Outfit',sans-serif;">Semanal</button>
              <button onclick="App.renderClientesPage('mensal')" style="position:relative; z-index:1; ${subTab === 'mensal' ? 'color: #FFFFFF; font-weight: 800;' : 'color: #7A7567; font-weight: 600;'} background:transparent; border:none; padding:6px 20px; border-radius:10px; font-size:13px; cursor:pointer; font-family:'Outfit',sans-serif;">Mensal</button>
              <button onclick="App.renderClientesPage('prospeccao')" style="position:relative; z-index:1; ${subTab === 'prospeccao' ? 'color: #FFFFFF; font-weight: 800;' : 'color: #7A7567; font-weight: 600;'} background:transparent; border:none; padding:6px 20px; border-radius:10px; font-size:13px; cursor:pointer; font-family:'Outfit',sans-serif;">Prospecção</button>
            </div>
            `}
          </div>
        </div>

        <!-- Master-Detail Grid -->
        <div style="display:grid; grid-template-columns:${window.innerWidth <= 768 ? '1fr' : '340px 1fr'}; gap:20px; min-height:calc(100vh - 200px);">
          <!-- LEFT: List -->
          <div style="display:flex; flex-direction:column; gap:0;">
            <!-- Search & Filters -->
            <div style="background:#FFFFFF; border-radius:16px; padding:16px; margin-bottom:12px; border:1px solid #F0ECE4; box-shadow:0 1px 4px rgba(0,0,0,0.04);">
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                <div style="flex:1; display:flex; align-items:center; gap:8px; background:#FDFBF9; border:1px solid #E2E8F0; border-radius:10px; padding:8px 12px;">
                  <i data-lucide="search" style="width:16px;height:16px;color:#7A7567;"></i>
                  <input type="text" placeholder="Buscar prospects..." oninput="App._filterProspects(this.value)" style="border:none; background:transparent; outline:none; font-size:13px; font-weight:500; font-family:'Outfit',sans-serif; width:100%; color:#1C1A14;" />
                </div>
              </div>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <button onclick="App._filterProspectStatus('todos')" class="prsp-filter-btn" style="font-size:11px; font-weight:700; padding:4px 12px; border-radius:8px; border:1px solid #E2E8F0; background:${this._prospeccaoFilter === 'todos' ? '#1C1A14' : '#FFFFFF'}; color:${this._prospeccaoFilter === 'todos' ? '#FFFFFF' : '#7A7567'}; cursor:pointer;">Todos</button>
                <button onclick="App._filterProspectStatus('enviado')" class="prsp-filter-btn" style="font-size:11px; font-weight:700; padding:4px 12px; border-radius:8px; border:1px solid #E2E8F0; background:${this._prospeccaoFilter === 'enviado' ? '#3B82F6' : '#FFFFFF'}; color:${this._prospeccaoFilter === 'enviado' ? '#FFFFFF' : '#7A7567'}; cursor:pointer;">Enviados</button>
                <button onclick="App._filterProspectStatus('respondido')" class="prsp-filter-btn" style="font-size:11px; font-weight:700; padding:4px 12px; border-radius:8px; border:1px solid #E2E8F0; background:${this._prospeccaoFilter === 'respondido' ? '#10B981' : '#FFFFFF'}; color:${this._prospeccaoFilter === 'respondido' ? '#FFFFFF' : '#7A7567'}; cursor:pointer;">Respondidos</button>
                <button onclick="App._filterProspectStatus('contratado')" class="prsp-filter-btn" style="font-size:11px; font-weight:700; padding:4px 12px; border-radius:8px; border:1px solid #E2E8F0; background:${this._prospeccaoFilter === 'contratado' ? '#E55A2B' : '#FFFFFF'}; color:${this._prospeccaoFilter === 'contratado' ? '#FFFFFF' : '#7A7567'}; cursor:pointer;">Contratados</button>
              </div>
            </div>
            <!-- Count -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; padding:0 4px;">
              <span style="font-size:13px; font-weight:700; color:#1C1A14;">${prospectsCount} Prospect${prospectsCount !== 1 ? 's' : ''}</span>
              <span style="font-size:11px; font-weight:600; color:#7A7567;">Ordenar por data</span>
            </div>
            <!-- List Items -->
            <div id="prsp-list-container" style="flex:1; overflow-y:auto; max-height:calc(100vh - 340px); padding-right:4px;">
              ${listHtml}
            </div>
          </div>

          <!-- RIGHT: Detail -->
          <div id="prsp-detail-panel" style="background:#FFFFFF; border-radius:20px; padding:28px; border:1px solid #F0ECE4; box-shadow:0 2px 12px rgba(0,0,0,0.04); overflow-y:auto; max-height:calc(100vh - 180px);">
            ${detailHtml}
          </div>
        </div>
      </div>
    `;
    pageContainer.innerHTML = html;
    if (API.getUser().role === 'criador') {
      pageContainer.innerHTML = this._translateClientesHtml(pageContainer.innerHTML);
    }
    Components.renderIcons();
  },

  _selectProspect(channelId) {
    this._selectedProspectId = channelId;
    this._renderProspeccaoPage(document.getElementById('page-container'), 'prospeccao');
  },

  _filterProspects(query) {
    this._prospeccaoSearch = query.toLowerCase();
    this._renderProspeccaoPage(document.getElementById('page-container'), 'prospeccao');
  },

  _filterProspectStatus(status) {
    this._prospeccaoFilter = status;
    this._renderProspeccaoPage(document.getElementById('page-container'), 'prospeccao');
  },

  _updateProspectStatus(channelId, newStatus) {
    try {
      const user = API.getUser();
      const prospectsKey = 'bancada_prospects_' + (user ? (user.email || user.id || 'default') : 'default');
      const stored = JSON.parse(localStorage.getItem(prospectsKey) || '[]');
      const idx = stored.findIndex(p => p.channelId === channelId);
      if (idx >= 0) {
        stored[idx].status = newStatus;
        localStorage.setItem(prospectsKey, JSON.stringify(stored));
        Components.toast(`Status atualizado para: ${newStatus}`, 'success');
        this._renderProspeccaoPage(document.getElementById('page-container'), 'prospeccao');
      }
    } catch (e) {
      console.error('Erro ao atualizar status:', e);
    }
  },

  _reenviarProposta(channelId) {
    const user = API.getUser();
    const prospectsKey = 'bancada_prospects_' + (user ? (user.email || user.id || 'default') : 'default');
    const stored = JSON.parse(localStorage.getItem(prospectsKey) || '[]');
    const p = stored.find(pp => pp.channelId === channelId);
    if (!p) return;
    const subjectEncoded = encodeURIComponent(p.subject);
    const bodyEncoded = encodeURIComponent(p.body);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${p.emailTo}&su=${subjectEncoded}&body=${bodyEncoded}`;
    window.open(gmailUrl, '_blank');
    Components.toast('Gmail aberto para reenvio!', 'success');
  },

  // ═══════════════════════════════════════════════════════════
  //  CONTRATAR PROSPECT MODAL — Financial/Task wizard integration
  // ═══════════════════════════════════════════════════════════
  async _openContratarProspectModal(channelId) {
    const user = API.getUser();
    const prospectsKey = 'bancada_prospects_' + (user ? (user.email || user.id || 'default') : 'default');
    const stored = JSON.parse(localStorage.getItem(prospectsKey) || '[]');
    const p = stored.find(pp => pp.channelId === channelId);
    if (!p) return;

    this._contratandoProspect = p;

    // Default checklists based on channel category
    const defaultChecklists = {
      'Games & Jogos': [
        'Analisar vídeo bruto',
        'Fazer rough cut / primeiro corte',
        'Adicionar memes e efeitos sonoros',
        'Ajustar trilha sonora e áudio',
        'Desenhar Thumbnail com alta taxa de clique (CTR)',
        'Exportar e entregar versão final'
      ],
      'Design & UX': [
        'Reunião de alinhamento visual',
        'Pesquisa de referências e painel semântico',
        'Criação de 3 opções de Thumbnail/capas',
        'Apresentação de layouts e ajustes',
        'Exportação de arquivos em alta resolução'
      ],
      'Tecnologia': [
        'Pesquisa de pauta / roteiro',
        'Análise de retenção do vídeo conceito',
        'Edição dinâmica de vídeo + B-Rolls',
        'Identidade visual gráfica das Thumbnails',
        'Revisão com o cliente e entrega final'
      ],
      'Culinária': [
        'Edição de vídeo com Food Appeal',
        'Cortes rápidos na batida da receita',
        'Ajuste fino de áudio e correção de cores',
        'Criação de Thumbnail com food appeal vibrante',
        'Entrega final do pacote'
      ],
      'Negócios': [
        'Criar gancho inicial forte de retenção',
        'Desenvolver narrativa (storytelling)',
        'Cortes dinâmicos e zoom para manter atenção',
        'Criação de Thumbnail corporativa premium',
        'Entrega do vídeo editado'
      ],
      'Geral': [
        'Alinhamento com o produtor',
        'Primeiro rascunho de montagem',
        'Rodada de correções e feedbacks',
        'Criação de Thumbnail alternativa',
        'Entrega do arquivo de vídeo final'
      ]
    };

    const listItems = defaultChecklists[p.category] || defaultChecklists['Geral'];
    
    // Fetch employee list (padeiros)
    let padeiros = [];
    try {
      padeiros = await API.get('/api/padeiros');
    } catch (err) {
      console.error('Erro ao buscar funcionários para o contrato:', err);
    }

    const padeirosHtml = padeiros.filter(x => x.ativo).map(x => `
      <option value="${x.id}" data-nome="${x.nome}" data-cod="${x.codTec}">${x.nome} — COD ${x.codTec}</option>
    `).join('');

    const checklistHtml = listItems.map((item, idx) => `
      <div class="contrato-checklist-row" style="display:flex; align-items:center; gap:8px; width:100%; margin-bottom: 4px;">
        <input type="text" class="p-input contrato-checklist-input" value="${item}" style="flex:1;" />
        <button type="button" class="btn-premium-danger" onclick="App._removeContratarChecklistItem(this)" title="Remover item" style="padding:0; width:36px; height:36px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
          <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
        </button>
      </div>
    `).join('');

    const contentHtml = `
      <form id="contrato-prospect-form" onsubmit="event.preventDefault(); App._confirmContratarProspect()" class="premium-desktop-form">
        <div class="p-bento-container">
          <!-- Coluna 1: Contrato e Financeiro -->
          <div class="p-bento-col">
            <div class="p-bento-card">
              <h4 class="p-bento-title"><i data-lucide="dollar-sign"></i> Contrato e Financeiro</h4>
              <div class="p-form-group">
                <label>Canal / Cliente</label>
                <input type="text" class="p-input" value="${p.channelName}" readonly style="background: var(--hig-bg-tertiary, #F8FAFC); font-weight:600;" />
              </div>
              <div class="p-form-group" style="margin-top: 12px;">
                <label>Preço Acordado (R$) <span style="font-weight:normal; opacity:0.7;">(Opcional)</span></label>
                <input type="number" id="contrato-preco" class="p-input" placeholder="Ex: 1500" step="0.01" min="0" />
              </div>
              <div class="p-form-group" style="margin-top: 12px; margin-bottom: 0;">
                <label>Observações do Contrato</label>
                <textarea id="contrato-obs" class="p-input" rows="3" placeholder="Notas sobre o acordo de parceria..." style="resize:none; font-family:inherit;"></textarea>
              </div>
            </div>
          </div>

          <!-- Coluna 2: Agendamento e Cronograma -->
          <div class="p-bento-col">
            <div class="p-bento-card">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
                <h4 class="p-bento-title" style="margin-bottom:0;"><i data-lucide="calendar"></i> Agendar no Cronograma</h4>
                <input type="checkbox" id="contrato-criar-tarefa" checked onchange="App._toggleContratarTaskSection(this.checked)" style="width:18px; height:18px; cursor:pointer; accent-color: var(--primary, #E55A2B);" />
              </div>

              <div id="contrato-task-section" style="display:flex; flex-direction:column; gap:12px;">
                <div class="p-form-group">
                  <label>Responsável (Funcionário)</label>
                  <select id="contrato-padeiro" class="p-input trello-select">
                    <option value="">Selecione o funcionário...</option>
                    ${padeirosHtml}
                  </select>
                </div>

                <div class="p-form-group">
                  <label>Prazo de Entrega (dias)</label>
                  <input type="number" id="contrato-dias" class="p-input" value="7" min="1" />
                </div>

                <div class="p-form-group" style="margin-bottom: 0;">
                  <label style="margin-bottom: 8px; display: block;">Checklist da Tarefa</label>
                  <div id="contrato-checklist-container" style="display:flex; flex-direction:column; gap:6px; max-height:160px; overflow-y:auto; padding-right:6px;">
                    ${checklistHtml}
                  </div>
                  <button type="button" onclick="App._addContratarChecklistItem()" class="btn-premium-secondary w-full mt-2" style="font-size:12px; padding:6px 12px; display:flex; align-items:center; justify-content:center; gap:6px; margin-top:8px;">
                    <i data-lucide="plus" style="width:14px;height:14px;"></i> Adicionar Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    `;

    const footerHtml = `
      <button type="button" class="btn-premium-secondary" onclick="Components.closeModal()">Cancelar</button>
      <button id="contrato-confirm-btn" type="button" class="btn-premium-primary" onclick="App._confirmContratarProspect()">
        <i data-lucide="check-circle" style="width:16px;height:16px;"></i> Confirmar Contratação
      </button>
    `;

    Components.showModal('Novo Orçamento & Parceria', contentHtml, footerHtml, 'premium-task-modal');
    Components.renderIcons();
  },

  _toggleContratarTaskSection(visible) {
    const el = document.getElementById('contrato-task-section');
    if (el) el.style.display = visible ? 'flex' : 'none';
  },

  _addContratarChecklistItem() {
    const container = document.getElementById('contrato-checklist-container');
    if (!container) return;
    const row = document.createElement('div');
    row.className = 'contrato-checklist-row';
    row.style.cssText = 'display:flex; align-items:center; gap:8px; width:100%; margin-bottom:4px;';
    row.innerHTML = `
      <input type="text" class="p-input contrato-checklist-input" placeholder="Novo item do checklist..." style="flex:1;" />
      <button type="button" class="btn-premium-danger" onclick="App._removeContratarChecklistItem(this)" title="Remover item" style="padding:0; width:36px; height:36px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
        <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
      </button>
    `;
    container.appendChild(row);
    Components.renderIcons();
    container.scrollTop = container.scrollHeight;
  },

  _removeContratarChecklistItem(btn) {
    btn.closest('.contrato-checklist-row')?.remove();
  },

  async _confirmContratarProspect() {
    const p = this._contratandoProspect;
    if (!p) return;

    const precoAcordado = parseFloat(document.getElementById('contrato-preco')?.value) || 0;
    const obs = document.getElementById('contrato-obs')?.value?.trim() || '';
    const criarTarefa = document.getElementById('contrato-criar-tarefa')?.checked;

    const confirmBtn = document.getElementById('contrato-confirm-btn');
    if (confirmBtn) {
      confirmBtn.setAttribute('disabled', 'true');
      confirmBtn.innerHTML = '<span class="mp-search-spinner" style="margin-right:8px;"></span> Processando...';
    }

    try {
      // 1. Criar novo Cliente para o Canal se não existir
      let clienteId = '';
      let clienteNome = p.channelName;

      // Consultar lista de clientes para checar duplicata
      const clientes = await API.get('/api/clientes');
      const existing = clientes.find(c => c.nome.toLowerCase() === clienteNome.toLowerCase());
      if (existing) {
        clienteId = existing.id;
      } else {
        const novo = await API.post('/api/clientes', {
          nome: clienteNome,
          receita: precoAcordado,
          custoInsumos: 0,
          endereco: 'Contato via YouTube',
          estado: 'SP',
          bairro: 'Internet'
        });
        clienteId = novo.id;
      }

      // 2. Criar Tarefas no Cronograma para TODOS os dias do prazo (se selecionado)
      if (criarTarefa) {
        const padeiroSel = document.getElementById('contrato-padeiro');
        const dias = parseInt(document.getElementById('contrato-dias')?.value, 10) || 7;

        let padeiroId = null;
        let padeiroNome = null;
        let codTec = null;

        if (padeiroSel && padeiroSel.selectedIndex > 0) {
          const opt = padeiroSel.options[padeiroSel.selectedIndex];
          padeiroId = opt.value || null;
          padeiroNome = opt.dataset.nome || null;
          codTec = opt.dataset.cod || null;
        }

        const checklistItems = [];
        document.querySelectorAll('.contrato-checklist-input').forEach(input => {
          const val = input.value.trim();
          if (val) {
            checklistItems.push({ text: val, done: false });
          }
        });

        // Criar uma tarefa para cada dia a partir de hoje até o final do prazo
        const now = new Date();
        const promises = [];
        for (let i = 0; i < dias; i++) {
          const d = new Date(now);
          d.setDate(d.getDate() + i);
          const dateStr = d.toISOString().split('T')[0];

          const taskPayload = {
            clienteId,
            clienteNome,
            data: dateStr,
            padeiroId: padeiroId || null,
            padeiroNome: padeiroNome || null,
            codTec: codTec || null,
            status: 'pendente',
            observacao: `Tarefa de produção de mídia - Canal ${clienteNome}.\nDia ${i + 1} de ${dias} do prazo.\nObservações do acordo: ${obs}`,
            checklist: checklistItems.map(item => ({ ...item })),
            tags: ['Parceria', p.category],
            horario: '09:00',
            horarioFim: '18:00',
            tempoMinimoMinutos: 0,
            kanbanListId: null
          };
          promises.push(API.post('/api/cronograma', taskPayload));
        }

        await Promise.all(promises);
      }

      // 3. Mudar status de prospecção para contratado
      const userVal = API.getUser();
      const prospectsKey = 'bancada_prospects_' + (userVal ? (userVal.email || userVal.id || 'default') : 'default');
      const stored = JSON.parse(localStorage.getItem(prospectsKey) || '[]');
      const idx = stored.findIndex(pp => pp.channelId === p.channelId);
      if (idx >= 0) {
        stored[idx].status = 'contratado';
        localStorage.setItem(prospectsKey, JSON.stringify(stored));
      }

      Components.closeModal();
      Components.toast('Parceria confirmada! Canal marcado como contratado e tarefas agendadas no Cronograma.', 'success');
      
      // Re-renderizar aba Prospecção
      this._renderProspeccaoPage(document.getElementById('page-container'), 'prospeccao');

    } catch (e) {
      console.error('[Contratação] Erro no fluxo:', e);
      Components.toast('Erro ao processar contratação: ' + e.message, 'error');
      if (confirmBtn) {
        confirmBtn.removeAttribute('disabled');
        confirmBtn.innerHTML = '<i data-lucide="check-circle" style="width:16px;height:16px;"></i> Confirmar Contratação';
        Components.renderIcons();
      }
    }
  },

  renderRoleSelectionPage(user, token) {
    return `
    <div style="
      min-height: 100vh;
      width: 100vw;
      background: #F4F1EA;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      box-sizing: border-box;
      font-family: 'Outfit', sans-serif;
    ">
      <div style="
        background: #FFFFFF;
        border: 1px solid #EBE5DF;
        border-radius: 28px;
        padding: 44px 36px;
        width: 100%;
        max-width: 480px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
        text-align: center;
      ">
        <div style="
          width: 60px; height: 60px;
          background: rgba(229, 90, 43, 0.1);
          border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 24px auto;
          color: #E55A2B;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>

        <h1 style="font-size: 26px; font-weight: 800; color: #1C1A14; margin: 0 0 10px 0; letter-spacing: -0.5px;">Escolha seu Perfil no Tomada</h1>
        <p style="font-size: 14px; color: #64748B; margin: 0 0 32px 0; line-height: 1.6;">
          Olá, <strong>${user.nome || user.email}</strong>! Para liberar seu acesso ao aplicativo, selecione o seu perfil:
        </p>

        <div style="display: flex; flex-direction: column; gap: 16px;">
          <button onclick="Auth.selectRole('${user.email}', 'criador', '${token}')" style="
            display: flex; align-items: center; gap: 20px;
            background: #FAF8F5; border: 2px solid #EBE5DF;
            border-radius: 20px; padding: 20px; text-align: left;
            cursor: pointer; transition: all 0.2s ease; width: 100%;
            outline: none;
          " onmouseover="this.style.borderColor='#E55A2B'; this.style.transform='translateY(-2px)';" onmouseout="this.style.borderColor='#EBE5DF'; this.style.transform='none';">
            <div style="
              width: 48px; height: 48px; background: rgba(229, 90, 43, 0.12);
              border-radius: 14px; display: flex; align-items: center; justify-content: center;
              color: #E55A2B; flex-shrink: 0;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7a2 2 0 0 0-2.45-1.45L11 8.75 1.45 5.55A2 2 0 0 0 0 7.4v11.8a2 2 0 0 0 1.45 1.95L11 23.25l9.55-3.2A2 2 0 0 0 22 18.1V7.4z"/><path d="M11 8.75V23.25"/></svg>
            </div>
            <div>
              <div style="font-weight: 800; font-size: 16px; color: #1C1A14; margin-bottom: 2px;">Criador</div>
              <div style="font-size: 12px; color: #7A7567; line-height: 1.4;">Tenho canais no YouTube e gerencio projetos e produção de vídeos.</div>
            </div>
          </button>

          <button onclick="Auth.selectRole('${user.email}', 'editor', '${token}')" style="
            display: flex; align-items: center; gap: 20px;
            background: #FAF8F5; border: 2px solid #EBE5DF;
            border-radius: 20px; padding: 20px; text-align: left;
            cursor: pointer; transition: all 0.2s ease; width: 100%;
            outline: none;
          " onmouseover="this.style.borderColor='#E55A2B'; this.style.transform='translateY(-2px)';" onmouseout="this.style.borderColor='#EBE5DF'; this.style.transform='none';">
            <div style="
              width: 48px; height: 48px; background: rgba(229, 90, 43, 0.12);
              border-radius: 14px; display: flex; align-items: center; justify-content: center;
              color: #E55A2B; flex-shrink: 0;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </div>
            <div>
              <div style="font-weight: 800; font-size: 16px; color: #1C1A14; margin-bottom: 2px;">Editor / Thumbmaker</div>
              <div style="font-size: 12px; color: #7A7567; line-height: 1.4;">Presto serviços de edição de vídeo, capas, miniaturas e design.</div>
            </div>
          </button>
        </div>
      </div>
    </div>
    `;
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());
