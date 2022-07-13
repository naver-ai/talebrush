import torch
import torch.nn as nn
class PROMPTEmbedding(nn.Module):
    def __init__(self, 
                wte: nn.Embedding,
                n_tokens: tuple = (10, 10, 10), 
                random_range: float = 0.5,
                initialize_from_vocab: bool = True, 
                prompt_token_id: int=50257,
                initialize_tokens: torch.Tensor=torch.LongTensor([])):  
        super(PROMPTEmbedding, self).__init__()
        self.wte = wte
        self.n_tokens = n_tokens
        self.learned_embedding = nn.parameter.Parameter(self.initialize_embedding(wte,
                                                                               n_tokens, 
                                                                               random_range, 
                                                                               initialize_from_vocab, initialize_tokens))
        self.prompt_token_id = prompt_token_id
    def initialize_embedding(self, 
                          wte: nn.Embedding,
                          n_tokens: tuple = (10, 10, 10), 
                          random_range: float = 0.5, 
                          initialize_from_vocab: bool = True,
                          initialize_tokens: torch.Tensor=torch.LongTensor([])):
        
        tot_tokens = sum(n_tokens)

        if initialize_from_vocab:
            if len(initialize_tokens)!=sum(n_tokens):
              assert 'init token length should match the number of tokens in n_tokens'
            # print('size', self.wte(initialize_tokens).size())
            return self.wte(initialize_tokens).clone().detach() # self.wte.weight[:tot_tokens].clone().detach()
        return torch.FloatTensor(wte.weight.size(1), tot_tokens).uniform_(-random_range, random_range)
            

    def return_embeddings(self):
      to_return = {}
      to_return['n_tokens'] = self.n_tokens
      to_return['learned_embedding'] = self.learned_embedding
      to_return['prompt_token_id'] = prompt_token_id

      return to_return
    
    def forward(self, tokens):
        # TODO separate!
        # input_embedding= self.wte(tokens)
        # print(input_embedding.size(0))
        learned_embedding = self.learned_embedding #.repeat(tokens.size(0), 1, 1)
        # print(tokens.size())
        embeddings = []

        prompt_counter = 0


        embeddings = self.wte(tokens)
        pre_indices = (tokens == self.prompt_token_id).nonzero()
        if pre_indices.size(0)==0:
          return embeddings
        if pre_indices.size(0)<sum(self.n_tokens):
          return embeddings
        blocked_indices = (tokens == self.prompt_token_id).nonzero().reshape((tokens.shape[0], sum(self.n_tokens), 2))[:, :, 1]
        
        
        for idx in range(blocked_indices.size(0)):
          for idx2 in range(blocked_indices.size(1)):
            # print('e', idx, blocked_indices[idx, idx2])
            embeddings[idx, blocked_indices[idx, idx2], :] = learned_embedding[idx2, :]
        return embeddings

        # embeddings = self.wte(tokens)
        # blocked_indices = (tokens == self.prompt_token_id).nonzero()
        # if blocked_indices.size(0)==0:
        #   return embeddings
        # blocked_indices.reshape((tokens.shape[0], sum(self.n_tokens), 2))[:, :, 1]
        # # print(blocked_indices)
        
        # for idx in range(blocked_indices.size(0)):
        #   for idx2 in range(sum(self.n_tokens)):
        #     embeddings[idx, blocked_indices[idx, idx2], :] = learned_embedding[idx2, :]
        # return embeddings

        # # John to Minsuk: This part is "that" poorly written part...
        # # TODO change the part below
        # whole = []
        # for idx in range(tokens.size(0)):
        #   row = []
        #   prompt_counter = 0
        #   for idx2 in range(tokens.size(1)):
        #     token = tokens[idx:idx+1, idx2:idx2+1]
        #     # print('token', token)
        #     if self.prompt_token_id in token:
        #       row.append(learned_embedding[prompt_counter:prompt_counter+1].repeat(1,1,1))
        #       prompt_counter = prompt_counter+1
        #     else:
        #       row.append(self.wte(token))
        #   # print(row)
        #   row = torch.cat(row, 1)
        #   # print(row.size())
        #   whole.append(row)
        # # print(whole.append(row))
        # # print(torch.cat(whole, 0).size())
        # return torch.cat(whole, 0)