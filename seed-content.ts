import { db } from './src/lib/db'

async function main() {
  console.log('Starting sample content seed...')

  const sampleContents = [
    {
      contentType: 'Movie',
      mainTitle: 'Inception',
      secondaryTitle: 'Inception (2010)',
      imageHtml: '<img src="https://image.tmdb.org/t/p/w500/9gk7admal4zl67YrxIo2AO08qX8.jpg" alt="Inception" />',
      name: 'Inception',
      season: null,
      imdbRating: 8.8,
      releaseYear: 2010,
      genre: JSON.stringify(['Action', 'Adventure', 'Thriller']),
      language: JSON.stringify(['English']),
      subtitle: JSON.stringify(['English', 'Hindi']),
      quality: JSON.stringify(['720p', '1080p']),
      fileSize: '2.1 GB',
      format: 'MKV',
      storyline: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
      downloadGroups: {
        create: [
          {
            title: 'Main Movie',
            links: {
              create: [
                {
                  title: 'Google Drive - 720p',
                  url: 'https://example.com/download/inception-720p',
                  quality: '720p',
                },
                {
                  title: 'Google Drive - 1080p',
                  url: 'https://example.com/download/inception-1080p',
                  quality: '1080p',
                },
              ],
            },
          },
        ],
      },
    },
    {
      contentType: 'Series',
      mainTitle: 'Breaking Bad',
      secondaryTitle: 'Breaking Bad (2008-2013)',
      imageHtml: '<img src="https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg" alt="Breaking Bad" />',
      name: 'Breaking Bad',
      season: 'Season 1',
      imdbRating: 9.5,
      releaseYear: 2008,
      genre: JSON.stringify(['Crime', 'Drama', 'Thriller']),
      language: JSON.stringify(['English']),
      subtitle: JSON.stringify(['English', 'Hindi', 'Japanese']),
      quality: JSON.stringify(['480p', '720p', '1080p']),
      fileSize: '4.5 GB',
      format: 'MKV',
      storyline: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future.',
      downloadGroups: {
        create: [
          {
            title: 'Season 1 Complete',
            links: {
              create: [
                {
                  title: 'Mega.nz - 480p',
                  url: 'https://example.com/download/bb-s1-480p',
                  quality: '480p',
                },
                {
                  title: 'Mega.nz - 720p',
                  url: 'https://example.com/download/bb-s1-720p',
                  quality: '720p',
                },
                {
                  title: 'Mega.nz - 1080p',
                  url: 'https://example.com/download/bb-s1-1080p',
                  quality: '1080p',
                },
              ],
            },
          },
        ],
      },
    },
    {
      contentType: 'Anime',
      mainTitle: 'Attack on Titan',
      secondaryTitle: 'Shingeki no Kyojin (2013-2023)',
      imageHtml: '<img src="https://image.tmdb.org/t/p/w500/r7Dfg9aRZ78gJsmDlCirIIlNH3d.jpg" alt="Attack on Titan" />',
      name: 'Attack on Titan',
      season: 'Season 1',
      imdbRating: 9.0,
      releaseYear: 2013,
      genre: JSON.stringify(['Action', 'Adventure', 'Animation']),
      language: JSON.stringify(['Japanese']),
      subtitle: JSON.stringify(['English', 'Hindi', 'Korean']),
      quality: JSON.stringify(['720p', '1080p']),
      fileSize: '6.2 GB',
      format: 'MKV',
      storyline: 'After his hometown is destroyed and his mother is killed, young Eren Jaeger vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.',
      downloadGroups: {
        create: [
          {
            title: 'Season 1 Complete',
            links: {
              create: [
                {
                  title: 'GDrive - 720p',
                  url: 'https://example.com/download/aot-s1-720p',
                  quality: '720p',
                },
                {
                  title: 'GDrive - 1080p',
                  url: 'https://example.com/download/aot-s1-1080p',
                  quality: '1080p',
                },
              ],
            },
          },
        ],
      },
    },
  ]

  for (const contentData of sampleContents) {
    await db.content.create({
      data: contentData,
    })
    console.log(`Created: ${contentData.mainTitle}`)
  }

  console.log('Sample content seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
