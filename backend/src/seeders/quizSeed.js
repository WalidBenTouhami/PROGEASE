module.exports = {
    titre: 'Quiz JavaScript',
    description: 'Testez vos connaissances en JavaScript.',
    dateCreation: new Date(), // Explicitly adding creation date
    questions: [
        {
            question: 'Quelle methode permet de convertir un JSON en objet ?',
            options: ['JSON.stringify()', 'JSON.parse()', 'JSON.objectify()'],
            answer: 'JSON.parse()',
        },
        {
            question: 'Quelle est la portee d\'une variable declaree avec `let` ?',
            options: ['Globale', 'Fonction', 'Bloc'],
            answer: 'Bloc',
        },
        {
            question: 'Quel mot-cle est utilise pour declarer une constante ?',
            options: ['let', 'const', 'var'],
            answer: 'const',
        },
        {
            question: 'Quelle methode est utilisee pour filtrer un tableau ?',
            options: ['.map()', '.filter()', '.reduce()'],
            answer: '.filter()',
        },
        {
            question: 'Quel est le type de `typeof null` ?',
            options: ['null', 'object', 'undefined'],
            answer: 'object',
        },
        {
            question: 'Comment declare-t-on une fonction flechee ?',
            options: ['function() {}', '() => {}', '=> function()'],
            answer: '() => {}',
        },
        {
            question: 'Quelle methode permet d\'ajouter un element à la fin d\'un tableau ?',
            options: ['push()', 'pop()', 'shift()'],
            answer: 'push()',
        },
        {
            question: 'Qu\'est-ce que `NaN` signifie ?',
            options: ['Null and Nothing', 'Not a Number', 'No actual Name'],
            answer: 'Not a Number',
        },
        {
            question: 'Comment verifier si une variable est un tableau ?',
            options: ['typeof x === \'array\'', 'x instanceof Array', 'Array.isArray(x)'],
            answer: 'Array.isArray(x)',
        },
        {
            question: 'Quelle boucle s\'utilise pour parcourir les cles d\'un objet ?',
            options: ['for...of', 'for...in', 'forEach'],
            answer: 'for...in',
        },
    ],
};
