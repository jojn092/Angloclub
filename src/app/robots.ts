import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/_next/', '/teacher/'],
        },
        sitemap: 'https://angloclub.kz/sitemap.xml',
    }
}
