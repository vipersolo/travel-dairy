import pandas as pd
import logging
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .models import Destination

logger = logging.getLogger(__name__)

class RecommendationService:
    """
    Handles Machine Learning algorithms for content recommendations.
    """
    
    @staticmethod
    def get_similar_destinations(target_destination_id, top_n=3):
        """
        Uses TF-IDF and Cosine Similarity to find destinations with similar 
        descriptions and countries. Returns a list of Destination IDs.
        """
        try:
            # 1. Fetch only the necessary fields from the database to save memory
            destinations = list(Destination.objects.all().values('id', 'name', 'country', 'description'))
            
            # If the database is empty or too small, abort gracefully
            if len(destinations) < 2:
                return []

            # 2. Load data into a Pandas DataFrame
            df = pd.DataFrame(destinations)

            # 3. Feature Engineering: Combine country and description into a single text blob
            # Filling NaNs with empty strings to prevent math errors
            df['combined_features'] = df['country'].fillna('') + " " + df['description'].fillna('')

            # 4. Vectorize Text (Convert words into numbers)
            # stop_words='english' removes useless words like 'the', 'is', 'and'
            tfidf = TfidfVectorizer(stop_words='english')
            tfidf_matrix = tfidf.fit_transform(df['combined_features'])

            # 5. Calculate Cosine Similarity across the entire matrix
            cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

            # 6. Locate the index of our target destination in the dataframe
            target_index = df.index[df['id'] == target_destination_id].tolist()
            if not target_index:
                return []
            idx = target_index[0]

            # 7. Get similarity scores for this specific destination
            sim_scores = list(enumerate(cosine_sim[idx]))
            
            #debugg
            print("TARGET:", df.iloc[idx]['name'])

            for score in sim_scores:
                print(df.iloc[score[0]]['name'], score[1])
            
            # 8. Sort the destinations based on the similarity scores (highest first)
            # x[1] is the score, x[0] is the dataframe index
            sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

            

            # 9. Extract the top N similar destinations (skipping index 0, which is the target itself)
            sim_scores = [x for x in sim_scores if x[0] != idx]
            sim_scores = sim_scores[:top_n]
            
            # 10. Map dataframe indices back to actual Database IDs
            similar_indices = [i[0] for i in sim_scores]
            recommended_ids = df.iloc[similar_indices]['id'].tolist()
            
            return recommended_ids

        except Exception as e:
            logger.error(f"ML Recommendation Engine failed: {e}")
            return []